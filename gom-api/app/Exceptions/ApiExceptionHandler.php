<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Throwable;

// Centralized API exception → JSON renderer. Returns unified { success, message, code?, errors? } shape.
class ApiExceptionHandler
{
    public static function render(Request $request, Throwable $e): ?JsonResponse
    {
        if (!$request->expectsJson() && !$request->is('api/*')) {
            return null;
        }

        $debug = config('app.debug');

        if ($e instanceof ValidationException) {
            return self::respond('Validation failed', 422, 'VALIDATION_ERROR', $e->errors());
        }

        if ($e instanceof AuthenticationException) {
            return self::respond('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if ($e instanceof AuthorizationException) {
            return self::respond('Forbidden', 403, 'FORBIDDEN');
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return self::respond('Resource not found', 404, 'NOT_FOUND');
        }

        if ($e instanceof MethodNotAllowedHttpException) {
            return self::respond('Method not allowed', 405, 'METHOD_NOT_ALLOWED');
        }

        if ($e instanceof HttpExceptionInterface) {
            return self::respond(
                $e->getMessage() ?: 'HTTP error',
                $e->getStatusCode(),
                'HTTP_ERROR'
            );
        }

        // Unhandled exception
        $message = $debug ? $e->getMessage() : 'Server error';
        $payload = [
            'success' => false,
            'message' => $message,
            'code'    => 'SERVER_ERROR',
        ];

        if ($debug) {
            $payload['debug'] = [
                'exception' => get_class($e),
                'file'      => $e->getFile(),
                'line'      => $e->getLine(),
            ];
        }

        return response()->json($payload, 500);
    }

    private static function respond(string $message, int $status, string $code, $errors = null): JsonResponse
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'code'    => $code,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }
}
