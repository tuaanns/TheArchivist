<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Custom CORS middleware must run first to handle OPTIONS preflight
        $middleware->prepend(\App\Http\Middleware\CorsMiddleware::class);
        $middleware->append(\App\Http\Middleware\AddCOOPHeader::class);
        
        // Register admin middleware alias
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Centralized API exception → JSON renderer
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            return \App\Exceptions\ApiExceptionHandler::render($request, $e);
        });
    })->create();
