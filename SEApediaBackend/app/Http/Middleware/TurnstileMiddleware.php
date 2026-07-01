<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class TurnstileMiddleware
{
    use ApiResponse;

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->input('cf-turnstile-response');

        if (!$token) {
            return $this->error('Captcha verification is required.', null, 422);
        }

        $secret = config('services.turnstile.secret');

        if (!$secret) {
            return $this->error('Turnstile is not configured on the server.', null, 500);
        }

        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $request->ip(),
        ]);

        $result = $response->json();

        if (!($result['success'] ?? false)) {
            return $this->error('Captcha verification failed. Please try again.', null, 422);
        }

        return $next($request);
    }
}
