<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Prediction\ChatRequest;
use App\Http\Requests\Prediction\PredictRequest;
use App\Models\Prediction;
use App\Models\TokenHistory;
use App\Services\AIService;
use App\Services\AzureBlobStorageService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PredictionController extends Controller
{
    use ApiResponses;

    public const FREE_LIMIT = 5;
    public const TOKEN_COST = 1.0;
    public const CHAT_COST  = 0.1;

    public function __construct(
        private AIService $aiService,
        private AzureBlobStorageService $azureStorage
    ) {}

    public function predict(PredictRequest $request): JsonResponse
    {
        set_time_limit(200);
        $user = $request->user();

        $freeUsed = (int) ($user->free_predictions_used ?? 0);
        $balance  = (float) ($user->token_balance ?? 0);

        if ($freeUsed >= self::FREE_LIMIT && $balance < self::TOKEN_COST) {
            return $this->fail(
                'Bạn đã hết 5 lượt miễn phí. Vui lòng nạp thêm để tiếp tục.',
                402,
                'PAYMENT_REQUIRED',
                ['free_used' => $freeUsed, 'token_balance' => $balance]
            );
        }

        $image = $request->file('image');

        try {
            $azureUrl = $this->azureStorage->uploadSingleFile($image, 'predictions');
        } catch (\Throwable $e) {
            Log::error('Azure upload failed', ['error' => $e->getMessage()]);
            return $this->serverError('Tải ảnh lên thất bại. Vui lòng thử lại.');
        }

        $prediction = Prediction::create([
            'user_id'          => $user->id,
            'image'            => $azureUrl,
            'final_prediction' => 'Đang phân tích...',
            'country'          => 'Đang xử lý',
            'era'              => 'Đang xử lý',
            'result_json'      => null,
        ]);

        $debateResult = $this->aiService->runMultiAgentDebate($image);

        if (isset($debateResult['error'])) {
            $prediction->update([
                'final_prediction' => 'Lỗi hệ thống AI',
                'era'              => 'Vui lòng thử lại',
                'result_json'      => ['error' => $debateResult['error']],
            ]);
            return $this->fail(
                'AI Server Error: ' . $debateResult['error'],
                502,
                'AI_SERVICE_ERROR',
                ['db_id' => $prediction->id]
            );
        }

        $final = $debateResult['final_report'] ?? [];
        $prediction->update([
            'final_prediction' => $final['final_prediction'] ?? 'Unknown',
            'country'          => $final['final_country'] ?? null,
            'era'              => $final['final_era'] ?? null,
            'result_json'      => $debateResult,
        ]);

        // Quota deduction
        $note = '';
        if ($user->free_predictions_used < self::FREE_LIMIT) {
            $user->increment('free_predictions_used');
            $remaining = self::FREE_LIMIT - $user->fresh()->free_predictions_used;
            $note = 'Lượt miễn phí còn lại: ' . $remaining;
        } else {
            $user->decrement('token_balance', self::TOKEN_COST);
            TokenHistory::create([
                'user_id'     => $user->id,
                'type'        => 'out',
                'amount'      => self::TOKEN_COST,
                'description' => 'Phân tích gốm: ' . ($final['final_prediction'] ?? 'Unknown'),
            ]);
            $note = 'Đã trừ 1 lượt. Còn lại: ' . (float) $user->fresh()->token_balance;
        }

        return $this->ok([
            'data'  => $debateResult,
            'db_id' => $prediction->id,
            'quota' => [
                'free_used'     => (int) $user->fresh()->free_predictions_used,
                'free_limit'    => self::FREE_LIMIT,
                'token_balance' => (float) $user->fresh()->token_balance,
                'note'          => $note,
            ],
        ], 'Phân tích hoàn tất');
    }

    public function chat(ChatRequest $request): JsonResponse
    {
        $user = $request->user();
        $query = $request->validated()['question'];
        $pythonAiUrl = rtrim((string) env('PYTHON_AI_URL', 'http://127.0.0.1:8001'), '/');

        $freeUsed = (int) ($user->free_predictions_used ?? 0);
        $balance  = (float) ($user->token_balance ?? 0);

        if ($freeUsed >= self::FREE_LIMIT && $balance < self::CHAT_COST) {
            return $this->fail(
                'Tài khoản của bạn đã hết lượt. Vui lòng nạp thêm lượt.',
                402,
                'PAYMENT_REQUIRED'
            );
        }

        $answer = 'Không thể kết nối đến AI Engine lúc này. Vui lòng thử lại sau.';
        $sources = [];

        try {
            $opts = [
                'http' => [
                    'method'  => 'POST',
                    'header'  => "Content-Type: application/json\r\n",
                    'content' => json_encode(['question' => $query]),
                    'timeout' => 30,
                ],
            ];
            $context = stream_context_create($opts);
            $aiResponse = @file_get_contents($pythonAiUrl . '/chat', false, $context);
            if ($aiResponse !== false) {
                $aiData = json_decode($aiResponse, true);
                $answer = $aiData['answer'] ?? $answer;
                $sources = $aiData['sources'] ?? [];
            }
        } catch (\Throwable $e) {
            Log::warning('AI chat failed', ['error' => $e->getMessage()]);
        }

        if ($user && $user->free_predictions_used >= self::FREE_LIMIT) {
            $user->decrement('token_balance', self::CHAT_COST);
            TokenHistory::create([
                'user_id'     => $user->id,
                'type'        => 'out',
                'amount'      => self::CHAT_COST,
                'description' => 'Trừ phí sử dụng Chatbot AI',
            ]);
        }

        return $this->ok([
            'answer'             => $answer,
            'tokens_charged'     => self::CHAT_COST,
            'user_token_balance' => (float) $user->fresh()->token_balance,
            'sources'            => $sources,
        ], 'OK');
    }

    public function history(): JsonResponse
    {
        $history = Prediction::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn ($item) => $this->formatPrediction($item));

        return $this->ok($history, 'OK');
    }

    public function show($id): JsonResponse
    {
        $item = Prediction::where('user_id', auth()->id())->findOrFail($id);
        return $this->ok($this->formatPrediction($item, true), 'OK');
    }

    // Format prediction to a stable shape that includes certainty + confidence
    private function formatPrediction(Prediction $item, bool $detailed = false): array
    {
        $imageUrl = filter_var($item->image, FILTER_VALIDATE_URL)
            ? $item->image
            : url('/api/img/' . $item->image);

        $resultJson = $item->result_json ?? [];
        $finalReport = is_array($resultJson) ? ($resultJson['final_report'] ?? []) : [];

        $confidence = $finalReport['confidence']
            ?? $finalReport['final_confidence']
            ?? null;

        $certainty = $finalReport['certainty']
            ?? $finalReport['assessment']
            ?? null;

        $payload = [
            'id'              => $item->id,
            'image_url'       => $imageUrl,
            'predicted_label' => $item->final_prediction,
            'country'         => $item->country,
            'era'             => $item->era,
            'confidence'      => $confidence !== null ? (float) $confidence : null,
            'certainty'       => $certainty,
            'created_at'      => $item->created_at,
        ];

        if ($detailed) {
            $payload['result'] = $resultJson;
            $payload['final_report'] = $finalReport;
        }

        return $payload;
    }
}
