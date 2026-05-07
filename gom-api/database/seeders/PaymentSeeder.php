<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\TokenHistory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    private const XOR_KEY = 0x5EAFB;

    private function encodeId(int $id): string
    {
        return strtoupper(dechex($id ^ self::XOR_KEY));
    }

    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Payment::truncate();
        TokenHistory::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $users = User::all();
        if ($users->isEmpty()) return;

        $packages = [
            1 => ['name' => 'Cơ Bản',     'price' => 150000,  'credits' => 10],
            2 => ['name' => 'Phổ Biến',   'price' => 600000,  'credits' => 50],
            3 => ['name' => 'Chuyên Gia', 'price' => 2000000, 'credits' => 200],
        ];

        $now = now();

        foreach ($users as $user) {
            $balance = (float) $user->token_balance;

            // Users with no balance and no free usage = no payments
            if ($balance <= 0 && $user->free_predictions_used === 0) continue;

            // Determine how many credits were purchased (must cover current balance + tokens spent)
            $tokenSpent   = (int) floor($balance / 10) * 1; // rough: 1 token per 10 credits consumed
            $totalNeeded  = $balance; // at minimum, enough for current balance

            // Build payment history that sums to at least $balance credits
            $paymentPlan  = $this->buildPaymentPlan($totalNeeded, $packages);

            $createdDays = rand(30, 180); // account creation offset

            foreach ($paymentPlan as $idx => [$pkgId, $status]) {
                $pkg = $packages[$pkgId];
                $payDate = $now->copy()->subDays($createdDays - ($idx * rand(5, 20)));

                $payment = Payment::create([
                    'user_id'       => $user->id,
                    'package_id'    => $pkgId,
                    'package_name'  => $pkg['name'],
                    'amount_vnd'    => $pkg['price'],
                    'credit_amount' => $pkg['credits'],
                    'hex_id'        => '',
                    'status'        => $status,
                    'expired_at'    => $payDate->copy()->addMinutes(60),
                    'created_at'    => $payDate,
                    'updated_at'    => $payDate->copy()->addMinutes(rand(1, 30)),
                ]);

                $payment->update(['hex_id' => $this->encodeId($payment->id)]);

                if ($status === 'completed') {
                    TokenHistory::create([
                        'user_id'     => $user->id,
                        'type'        => 'in',
                        'amount'      => $pkg['credits'],
                        'description' => 'Nạp tiền: ' . $pkg['name'],
                        'created_at'  => $payDate,
                        'updated_at'  => $payDate,
                    ]);
                }
            }

            // Token OUT: one record per token-based prediction used
            $tokenPreds = $balance > 0 ? min((int) floor($balance / 10), 15) : 0;
            for ($j = 0; $j < $tokenPreds; $j++) {
                TokenHistory::create([
                    'user_id'     => $user->id,
                    'type'        => 'out',
                    'amount'      => 1,
                    'description' => 'Phân tích gốm sứ (1 lượt)',
                    'created_at'  => $now->copy()->subDays(rand(1, 60)),
                    'updated_at'  => $now->copy()->subDays(rand(0, 2)),
                ]);
            }
        }
    }

    /**
     * Build a list of [package_id, status] that logically covers the needed credits.
     * Returns 1-4 payments per user.
     */
    private function buildPaymentPlan(float $needed, array $packages): array
    {
        $plan = [];

        if ($needed <= 0) {
            // No purchases but add 1 failed attempt for variety
            $plan[] = [rand(1, 2), 'failed'];
            return $plan;
        }

        $accumulated = 0;
        $attempts    = 0;

        while ($accumulated < $needed && $attempts < 4) {
            // Pick best fitting package
            if ($needed - $accumulated >= 200) {
                $pkgId = 3;
            } elseif ($needed - $accumulated >= 50) {
                $pkgId = 2;
            } else {
                $pkgId = 1;
            }

            $plan[]      = [$pkgId, 'completed'];
            $accumulated += $packages[$pkgId]['credits'];
            $attempts++;
        }

        // Randomly add 1 failed or pending payment for realism
        if (rand(0, 2) > 0) {
            $plan[] = [rand(1, 2), rand(0, 1) ? 'failed' : 'pending'];
        }

        return $plan;
    }
}
