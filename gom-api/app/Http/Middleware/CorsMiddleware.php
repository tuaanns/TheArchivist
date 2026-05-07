<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    // Handle CORS headers for allowed origins (localhost, Vercel deployments)
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');

        // List of allowed origins
        $allowedOrigins = [
            'https://thearchivistai.vercel.app',
            'https://the-archivist-ai.vercel.app',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ];

        // For development, allow all localhost origins
        if ($origin && (str_starts_with($origin, 'http://localhost') || str_starts_with($origin, 'http://127.0.0.1'))) {
            $allowedOrigins[] = $origin;
        }

        // Allow all Vercel preview deployments
        if ($origin && str_contains($origin, '.vercel.app')) {
            $allowedOrigins[] = $origin;
        }

        // Check if origin is allowed
        $isAllowed = $origin && in_array($origin, $allowedOrigins);

        // Handle preflight OPTIONS request - MUST return 200 with headers
        if ($request->isMethod('OPTIONS')) {
            $response = response('', 200);

            // Always set CORS headers for OPTIONS, even if origin not in list
            // This is important for Vercel deployments with dynamic subdomains
            if ($isAllowed || ($origin && str_contains($origin, '.vercel.app'))) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
                $response->headers->set('Access-Control-Allow-Credentials', 'true');
            }
            
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token');
            $response->headers->set('Access-Control-Max-Age', '86400');

            return $response;
        }

        // Handle actual request
        $response = $next($request);

        if ($isAllowed || ($origin && str_contains($origin, '.vercel.app'))) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-Token');

        return $response;
    }
}
