<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

/**
 * ApiResponse Trait
 *
 * Provides consistent JSON response helpers for all API controllers.
 * Use this trait in any controller that returns JSON responses to ensure
 * a uniform envelope structure: { success, message, data/errors }.
 */
trait ApiResponse
{
    /**
     * Return a successful JSON response.
     *
     * @param  mixed       $data    Payload to return (array, Resource, Collection, etc.)
     * @param  string      $message Human-readable success message.
     * @param  int         $status  HTTP status code (default: 200).
     */
    protected function success(mixed $data = null, string $message = 'Success.', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Return an error JSON response.
     *
     * @param  string      $message Human-readable error message.
     * @param  mixed       $errors  Validation errors or additional context (nullable).
     * @param  int         $status  HTTP status code (default: 400).
     */
    protected function error(string $message = 'An error occurred.', mixed $errors = null, int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }
}
