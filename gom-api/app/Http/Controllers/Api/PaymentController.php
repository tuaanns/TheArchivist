<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\CreatePaymentRequest;
use App\Models\Payment;
use App\Models\TokenHistory;
use App\Traits\ApiResponses;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    use ApiResponses;

    public const SECRET_XOR_KEY = 0x5EAFB;
    public const FREE_LIMIT = 5;

    public const PACKAGES = [
        1 => ['name' => 'Cơ Bản',     'price' => 150000,  'credits' => 10,  'featured' => false, 'discount' => null],
        2 => ['name' => 'Phổ Biến',   'price' => 600000,  'credits' => 50,  'featured' => true,  'discount' => 'Tiết kiệm 20%'],
        3 => ['name' => 'Chuyên Gia', 'price' => 2000000, 'credits' => 200, 'featured' => false, 'discount' => '-30%'],
    ];

    private function encodeId(int $id): string
    {
        return strtoupper(dechex($id ^ self::SECRET_XOR_KEY));
    }

    public function getStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        return $this->ok([
            'token_balance'         => (float) $user->token_balance,
            'free_predictions_used' => (int) $user->free_predictions_used,
            'free_limit'            => self::FREE_LIMIT,
            'can_predict'           => $user->free_predictions_used < self::FREE_LIMIT || $user->token_balance > 0,
        ]);
    }

    public function getPackages(): JsonResponse
    {
        $packages = [];
        foreach (self::PACKAGES as $id => $pkg) {
            $packages[] = [
                'id'       => $id,
                'name'     => $pkg['name'],
                'price'    => $pkg['price'],
                'credits'  => $pkg['credits'],
                'featured' => $pkg['featured'],
                'discount' => $pkg['discount'],
            ];
        }
        return $this->ok($packages);
    }

    public function getHistory(Request $request): JsonResponse
    {
        $history = Payment::where('user_id', $request->user()->id)
            ->latest()
            ->take(50)
            ->get()
            ->map(fn (Payment $p) => [
                'id'            => $p->id,
                'package_id'    => $p->package_id,
                'package_name'  => $p->package_name,
                'amount'        => (float) $p->amount_vnd,
                'credit_amount' => (int) $p->credit_amount,
                'status'        => $p->status,
                'created_at'    => $p->created_at,
            ]);

        return $this->ok($history);
    }

    public function createPayment(CreatePaymentRequest $request): JsonResponse
    {
        $packageId = (int) $request->validated()['package_id'];

        if (!isset(self::PACKAGES[$packageId])) {
            return $this->fail('Gói không tồn tại.', 422, 'INVALID_PACKAGE');
        }

        $pkg = self::PACKAGES[$packageId];

        $payment = Payment::create([
            'user_id'       => $request->user()->id,
            'package_id'    => $packageId,
            'package_name'  => $pkg['name'],
            'amount_vnd'    => $pkg['price'],
            'credit_amount' => $pkg['credits'],
            'status'        => 'pending',
            'expired_at'    => Carbon::now()->addMinutes(60),
        ]);

        $hexId = $this->encodeId($payment->id);
        $payment->update(['hex_id' => $hexId]);

        $siteName = env('SEPAY_SITE_NAME', 'GOMAI');
        $bankName = env('SEPAY_BANK_NAME', 'ACB');
        $account  = env('SEPAY_BANK_ACCOUNT', '28569967');
        $owner    = env('SEPAY_BANK_OWNER', 'MA GIA TUAN');
        $content  = strtoupper($siteName) . 'NAPTOKEN' . $hexId;

        $qrUrl = sprintf(
            'https://qr.sepay.vn/img?bank=%s&acc=%s&template=compact&amount=%d&des=%s',
            urlencode($bankName),
            urlencode($account),
            $pkg['price'],
            urlencode($content),
        );

        return $this->ok([
            'id'               => $payment->id,
            'payment_id'       => $payment->id,
            'hex_id'           => $hexId,
            'amount'           => (float) $pkg['price'],
            'transfer_content' => $content,
            'bank_name'        => $bankName,
            'account_number'   => $account,
            'account_name'     => $owner,
            'qr_url'           => $qrUrl,
            'package'          => [
                'id'      => $packageId,
                'name'    => $pkg['name'],
                'credits' => $pkg['credits'],
                'price'   => $pkg['price'],
            ],
            'expired_at' => $payment->expired_at,
        ], 'Đơn hàng đã được tạo');
    }

    public function checkStatus(Request $request, $paymentId): JsonResponse
    {
        $payment = Payment::where('id', $paymentId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($payment->status === 'completed') {
            return $this->ok([
                'status'        => 'completed',
                'credit_amount' => (int) $payment->credit_amount,
            ]);
        }

        if ($payment->status === 'failed' || ($payment->expired_at && Carbon::now()->gt($payment->expired_at))) {
            $payment->update(['status' => 'failed']);
            return $this->ok(['status' => 'failed']);
        }

        // Poll SePay
        $apiKey = env('SEPAY_API_KEY', '');
        if ($apiKey) {
            try {
                $resp = Http::withHeaders(['Authorization' => 'Bearer ' . $apiKey])
                    ->get('https://my.sepay.vn/userapi/transactions/list', ['limit' => 20]);
                if ($resp->successful()) {
                    $siteName = strtoupper(env('SEPAY_SITE_NAME', 'GOMAI'));
                    foreach (($resp->json()['transactions'] ?? []) as $tx) {
                        $content = strtoupper($tx['transaction_content'] ?? '');
                        if (str_contains($content, $siteName . 'NAPTOKEN' . $payment->hex_id)) {
                            if ((float) ($tx['amount_in'] ?? 0) >= (float) $payment->amount_vnd) {
                                $this->markPaymentCompleted($payment, $tx['id'] ?? null);
                                return $this->ok([
                                    'status'        => 'completed',
                                    'credit_amount' => (int) $payment->credit_amount,
                                ]);
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('SePay poll failed', ['error' => $e->getMessage()]);
            }
        }

        return $this->ok(['status' => 'pending']);
    }

    public function testCompletePayment(Request $request, $paymentId): JsonResponse
    {
        $payment = Payment::where('id', $paymentId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($payment->status !== 'completed') {
            $this->markPaymentCompleted($payment, null, '(TEST) ');
        }

        return $this->ok([
            'status'        => 'completed',
            'credit_amount' => (int) $payment->credit_amount,
        ], 'Test payment completed');
    }

    private function markPaymentCompleted(Payment $payment, $sepayTxId = null, string $prefix = ''): void
    {
        $payment->update([
            'status'      => 'completed',
            'sepay_tx_id' => $sepayTxId,
        ]);
        $user = $payment->user ?? auth()->user();
        if ($user) {
            $user->increment('token_balance', $payment->credit_amount);
            TokenHistory::create([
                'user_id'     => $user->id,
                'type'        => 'in',
                'amount'      => $payment->credit_amount,
                'description' => $prefix . 'Nạp tiền: ' . $payment->package_name,
            ]);
        }
    }
}
