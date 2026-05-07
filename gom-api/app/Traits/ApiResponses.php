<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

// Standardized API response helpers: success { success, message, data, meta? } / error { success, message, code?, errors? }
trait ApiResponses
{
    protected function ok($data = null, string $message = 'OK', array $meta = [], int $status = 200): JsonResponse
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    protected function created($data = null, string $message = 'Created'): JsonResponse
    {
        return $this->ok($data, $message, [], 201);
    }

    protected function noContent(string $message = 'No content'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], 204);
    }

    protected function fail(string $message = 'Error', int $status = 400, ?string $code = null, $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($code) {
            $payload['code'] = $code;
        }

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return $this->fail($message, 401, 'UNAUTHORIZED');
    }

    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->fail($message, 403, 'FORBIDDEN');
    }

    protected function notFound(string $message = 'Not found'): JsonResponse
    {
        return $this->fail($message, 404, 'NOT_FOUND');
    }

    protected function validationError($errors, string $message = 'Validation failed'): JsonResponse
    {
        return $this->fail($message, 422, 'VALIDATION_ERROR', $errors);
    }

    protected function serverError(string $message = 'Server error'): JsonResponse
    {
        return $this->fail($message, 500, 'SERVER_ERROR');
    }
}
