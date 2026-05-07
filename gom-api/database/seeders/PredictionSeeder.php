<?php

namespace Database\Seeders;

use App\Models\Prediction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

/**
 * PredictionSeeder
 *
 * Calls the REAL Python AI debate server (PYTHON_AI_URL) for a small curated
 * set of ceramic photos, caches the responses, then distributes the cached
 * (real) results across users so admin Predictions / History views show
 * authentic AI debate output.
 *
 * Behaviour:
 *  - On first run with AI server reachable: downloads source images from
 *    Wikipedia (real existing photos), POSTs each to /predict, persists
 *    every successful debate response to a JSON cache.
 *  - On subsequent runs (or when AI is offline): re-uses the cache.
 *  - If neither cache nor AI is available: prints a clear warning and exits
 *    cleanly (no fake data is produced).
 */
class PredictionSeeder extends Seeder
{
    /** Cache file relative to storage/app/. Survives re-runs of `db:seed`. */
    private const CACHE_PATH = 'seeders/ai_predictions.json';

    /** Per-AI-call timeout. Multi-agent debate can take a while. */
    private const AI_TIMEOUT_SECONDS = 240;

    /** Retry an overloaded AI server up to N times before giving up on this image. */
    private const AI_MAX_ATTEMPTS = 4;

    /** Pause between successful images to be nice to upstream LLM rate limits. */
    private const PACING_SECONDS = 12;

    /** Curated source images. Articles where the canonical Wikipedia image
     *  is unambiguously a ceramic artifact (so the vision agent's
     *  "is_pottery" check passes). Each gets one real AI call. */
    private const CERAMIC_SOURCES = [
        'bat_trang'      => ['Bát_Tràng', 'Vietnamese_pottery'],
        'jingdezhen'     => ['Jingdezhen_porcelain'],
        'goryeo_celadon' => ['Korean_celadon', 'Goryeo_celadon'],
        'iznik'          => ['İznik_pottery', 'Iznik_pottery'],
        'meissen'        => ['Meissen_porcelain'],
        'delft'          => ['Delftware'],
        'yixing'         => ['Yixing_clay_teapot'],
        'longquan'       => ['Longquan_celadon'],
    ];

    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Prediction::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $users = User::all();
        if ($users->isEmpty()) {
            $this->msg('No users — skipping.');
            return;
        }

        // 1) Load or generate REAL AI results.
        $aiResults = $this->loadOrGenerateAIResults();
        if (empty($aiResults)) {
            $this->msg(
                'No real AI results available (cache empty AND AI server unreachable). ' .
                "Skipping prediction seeding. Start the Python AI server at " .
                "PYTHON_AI_URL (default http://127.0.0.1:8001) and re-run: " .
                'php artisan db:seed --class=PredictionSeeder',
                'warn'
            );
            return;
        }

        $this->msg('Distributing ' . count($aiResults) . ' real AI results across users...');

        // 2) Distribute across users. Each user's predictions = free_used + token_preds,
        //    matching the contract used by PaymentSeeder.
        $aiKeys  = array_keys($aiResults);
        $now     = now();
        $idx     = 0;
        $inserts = [];

        foreach ($users as $user) {
            $freeUsed   = (int) $user->free_predictions_used;
            $balance    = (float) $user->token_balance;
            $tokenPreds = $balance > 0 ? min((int) floor($balance / 10), 15) : 0;
            $count      = $freeUsed + $tokenPreds;

            if ($count === 0) {
                continue;
            }

            $regDays = $user->created_at
                ? max(1, (int) now()->diffInDays($user->created_at))
                : 90;

            for ($i = 0; $i < $count; $i++) {
                $key   = $aiKeys[$idx % count($aiKeys)];
                $entry = $aiResults[$key];
                $idx++;

                $resultJson  = $entry['result'];
                $finalReport = is_array($resultJson) ? ($resultJson['final_report'] ?? []) : [];

                $createdAt = $now->copy()->subDays(rand(1, max(1, $regDays - 1)))
                                   ->subHours(rand(0, 23));

                $inserts[] = [
                    'user_id'          => $user->id,
                    'image'            => $entry['image_url'],
                    'final_prediction' => $finalReport['final_prediction'] ?? 'Unknown',
                    'country'          => $finalReport['final_country'] ?? null,
                    'era'              => $finalReport['final_era'] ?? null,
                    'result_json'      => json_encode($resultJson, JSON_UNESCAPED_UNICODE),
                    'created_at'       => $createdAt->toDateTimeString(),
                    'updated_at'       => $createdAt->copy()->addMinutes(rand(1, 5))->toDateTimeString(),
                ];
            }
        }

        foreach (array_chunk($inserts, 100) as $chunk) {
            Prediction::insert($chunk);
        }

        $this->msg('Inserted ' . count($inserts) . ' predictions backed by real AI debates.');
    }

    // ────────────────────────────────────────────────────────────────────────
    // AI cache management
    // ────────────────────────────────────────────────────────────────────────

    /**
     * Returns array<string, ['image_url' => string, 'result' => array]>.
     */
    private function loadOrGenerateAIResults(): array
    {
        $cached = $this->loadCache();

        // Decide which keys still need an AI call.
        $missingKeys = array_diff(array_keys(self::CERAMIC_SOURCES), array_keys($cached));
        if (empty($missingKeys)) {
            $this->msg('Using cached AI results (' . count($cached) . ' entries).');
            return $cached;
        }

        $this->msg('Cache has ' . count($cached) . ' entries; need to call AI for ' .
            count($missingKeys) . ' more: ' . implode(', ', $missingKeys));

        // Resolve image URLs (Wikipedia summary → originalimage / thumbnail).
        // IMPORTANT: keep cache-key indexing — do NOT array_values() here, otherwise
        // downstream lookups by key (bat_trang, iznik, ...) all return null.
        $imageUrls = $this->resolveCeramicImageUrls(array_intersect_key(
            self::CERAMIC_SOURCES,
            array_flip($missingKeys)
        ));

        $aiBase = rtrim((string) env('PYTHON_AI_URL', 'http://127.0.0.1:8001'), '/');

        // Quick reachability ping (don't waste time downloading images if AI is down).
        if (!$this->aiServerReachable($aiBase)) {
            $this->msg("AI server at $aiBase is unreachable. Falling back to cache only.", 'warn');
            return $cached;
        }

        $first = true;
        foreach ($missingKeys as $key) {
            $url = $imageUrls[$key] ?? null;
            if (!$url) {
                $this->msg("[$key] could not resolve a Wikipedia image URL; skipping.", 'warn');
                continue;
            }

            // Pace between images so we don't hammer LLM rate limits.
            if (!$first) {
                $this->msg("Sleeping " . self::PACING_SECONDS . "s before next image (rate-limit pacing)...");
                sleep(self::PACING_SECONDS);
            }
            $first = false;

            $this->msg("[$key] downloading image: $url");
            $bytes = $this->downloadBytes($url);
            if ($bytes === null) {
                $this->msg("[$key] download failed.", 'warn');
                continue;
            }

            $filename = basename(parse_url($url, PHP_URL_PATH) ?: '') ?: ($key . '.jpg');
            $result = $this->callAIWithRetry($aiBase, $bytes, $filename, $key);
            if ($result === null) {
                continue; // Already logged inside helper.
            }

            $finalLabel = $result['final_report']['final_prediction'] ?? 'Unknown';
            $cached[$key] = ['image_url' => $url, 'result' => $result];
            $this->msg("[$key] OK → $finalLabel");

            // Persist after every successful call so we don't lose progress on Ctrl+C.
            $this->saveCache($cached);
        }

        return $cached;
    }

    /**
     * POST to /predict with exponential backoff retry on overload-style errors.
     */
    private function callAIWithRetry(string $aiBase, string $bytes, string $filename, string $key): ?array
    {
        $attempt = 0;
        $backoff = 8;

        while ($attempt < self::AI_MAX_ATTEMPTS) {
            $attempt++;
            $this->msg("[$key] calling AI /predict (attempt $attempt/" . self::AI_MAX_ATTEMPTS . ", may take 30-90s)...");

            try {
                $resp = Http::withoutVerifying()
                    ->timeout(self::AI_TIMEOUT_SECONDS)
                    ->connectTimeout(15)
                    ->attach('file', $bytes, $filename)
                    ->post("$aiBase/predict");

                if ($resp->successful()) {
                    $json = $resp->json();
                    if (!is_array($json)) {
                        $this->msg("[$key] AI returned non-JSON; skipping.", 'warn');
                        return null;
                    }
                    if (isset($json['error'])) {
                        // Engine-level error (likely vision/quota). Retry only if transient.
                        $err = (string) $json['error'];
                        if ($this->isTransientError($err) && $attempt < self::AI_MAX_ATTEMPTS) {
                            $this->msg("[$key] transient engine error: $err — backing off {$backoff}s.", 'warn');
                            sleep($backoff);
                            $backoff *= 2;
                            continue;
                        }
                        $this->msg("[$key] AI engine error: $err", 'warn');
                        return null;
                    }
                    return $json;
                }

                // Non-2xx response.
                $body = $resp->body();
                $status = $resp->status();
                if ($this->isTransientHttpFailure($status, $body) && $attempt < self::AI_MAX_ATTEMPTS) {
                    $this->msg(
                        "[$key] HTTP $status (transient) — backing off {$backoff}s. Body: " .
                        substr($body, 0, 160),
                        'warn'
                    );
                    sleep($backoff);
                    $backoff *= 2;
                    continue;
                }
                $this->msg("[$key] HTTP $status — giving up. Body: " . substr($body, 0, 200), 'warn');
                return null;
            } catch (\Throwable $e) {
                if ($attempt < self::AI_MAX_ATTEMPTS) {
                    $this->msg("[$key] exception (will retry in {$backoff}s): " . $e->getMessage(), 'warn');
                    sleep($backoff);
                    $backoff *= 2;
                    continue;
                }
                $this->msg("[$key] exception (giving up): " . $e->getMessage(), 'warn');
                return null;
            }
        }
        return null;
    }

    private function isTransientError(string $msg): bool
    {
        $lower = mb_strtolower($msg, 'UTF-8');
        return str_contains($lower, 'quá tải')
            || str_contains($lower, 'qua tai')
            || str_contains($lower, 'rate')
            || str_contains($lower, 'quota')
            || str_contains($lower, 'try again')
            || str_contains($lower, 'thử lại')
            || str_contains($lower, 'hết quota');
    }

    private function isTransientHttpFailure(int $status, string $body): bool
    {
        // 5xx is generally retriable; treat 429 as well.
        if ($status === 429) return true;
        if ($status >= 500 && $status < 600) return true;
        return $this->isTransientError($body);
    }

    private function loadCache(): array
    {
        $path = storage_path('app/' . self::CACHE_PATH);
        if (!file_exists($path)) {
            return [];
        }
        $raw = file_get_contents($path);
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }

    private function saveCache(array $data): void
    {
        $path = storage_path('app/' . self::CACHE_PATH);
        @mkdir(dirname($path), 0775, true);
        file_put_contents(
            $path,
            json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // Wikipedia image URL resolution + HTTP helpers
    // ────────────────────────────────────────────────────────────────────────

    /**
     * @param array<string, string[]> $sources Map of cache_key => [primary, fallbacks...]
     * @return array<string, string> Map of cache_key => image_url
     */
    private function resolveCeramicImageUrls(array $sources): array
    {
        $resolved = [];
        foreach ($sources as $key => $titles) {
            $titles = is_array($titles) ? $titles : [(string) $titles];
            foreach ($titles as $title) {
                $url = $this->wikiOriginalImage($title);
                if ($url) {
                    $resolved[$key] = $url;
                    break;
                }
            }
        }
        return $resolved;
    }

    /** Fetch original (or large thumbnail) image URL for a Wikipedia article. */
    private function wikiOriginalImage(string $title): ?string
    {
        try {
            $resp = Http::withoutVerifying()
                ->timeout(10)
                ->withHeaders(['User-Agent' => 'GomApp-Seeder/1.0 (ceramic-db-seed)'])
                ->get('https://en.wikipedia.org/api/rest_v1/page/summary/' . urlencode($title));
            if (!$resp->ok()) {
                return null;
            }
            $j = $resp->json();
            // Prefer originalimage (full quality) but fall back to thumbnail.
            return $j['originalimage']['source'] ?? $j['thumbnail']['source'] ?? null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function downloadBytes(string $url): ?string
    {
        try {
            $resp = Http::withoutVerifying()
                ->timeout(30)
                ->withHeaders(['User-Agent' => 'GomApp-Seeder/1.0'])
                ->get($url);
            if (!$resp->successful()) {
                return null;
            }
            return $resp->body() ?: null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function aiServerReachable(string $base): bool
    {
        try {
            $resp = Http::withoutVerifying()->timeout(8)->connectTimeout(5)->get($base . '/');
            return $resp->successful();
        } catch (\Throwable $e) {
            return false;
        }
    }

    // ────────────────────────────────────────────────────────────────────────

    private function msg(string $text, string $level = 'info'): void
    {
        $line = '[PredictionSeeder] ' . $text;
        if ($this->command) {
            match ($level) {
                'warn'  => $this->command->warn($line),
                'error' => $this->command->error($line),
                default => $this->command->info($line),
            };
        } else {
            // Fallback when invoked without artisan command context.
            fwrite(STDERR, $line . PHP_EOL);
        }
    }
}
