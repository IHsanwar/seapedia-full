<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    use ApiResponse;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->error('Unauthenticated.', null, 401);
        }

        foreach ($roles as $role) {
            if ($user->currentAccessToken() && $user->currentAccessToken()->can('role:' . $role)) {
                return $next($request);
            }
        }

        return $this->error('Forbidden. You do not have the required role to access this resource.', null, 403);
    }
}
