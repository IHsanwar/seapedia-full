<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

/**
 * @group Profile & Dashboard
 * 
 * APIs for viewing user profile and multi-role dashboard summaries.
 * 
 * @authenticated
 */
class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Get multi-role dashboard summary.
     * 
     * Returns the user's basic profile, owned roles, current active role, 
     * and a placeholder for financial summaries across all their roles 
     * (e.g. Wallet, Seller Income, Driver Earnings).
     * 
     * A user with multiple roles needs to know their overall financial status,
     * even if their active role restricts their access to certain features.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user()->load(['roles', 'driver', 'wallet']);
        
        $activeRole = null;
        if ($user->currentAccessToken()) {
            $abilities = $user->currentAccessToken()->abilities;
            foreach ($abilities as $ability) {
                if (str_starts_with($ability, 'role:')) {
                    $activeRole = str_replace('role:', '', $ability);
                    break;
                }
            }
        }

        $ownedRoles = $user->roles->pluck('name')->toArray();

        $wallet = $user->wallet;
        $walletBalance = $wallet ? (float) $wallet->balance : 0;

        $driverEarnings = 0;
        $driverStats = null;

        try {
            if ($user->driver) {
                $driverEarnings = $user->driver->calculateEarnings();
                $driverStats = [
                    'completed_jobs' => $user->driver->completedDeliveries()->count(),
                    'active_jobs' => $user->driver->activeDeliveries()->count(),
                ];
            }
        } catch (\Exception $e) {
            $driverEarnings = 0;
            $driverStats = null;
        }

        $financialSummaries = [
            'wallet_balance' => $walletBalance,
            'seller_income' => 0,
            'driver_earnings' => $driverEarnings,
        ];

        $response = [
            'user' => new UserResource($user),
            'active_role' => $activeRole,
            'owned_roles' => $ownedRoles,
            'financial_summaries' => $financialSummaries,
        ];

        if ($driverStats) {
            $response['driver_stats'] = $driverStats;
        }

        return $this->success($response, 'Dashboard summary retrieved successfully.');
    }

    /**
     * Get user profile.
     * 
     * Returns the authenticated user's profile information.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load('roles', 'driver');
        
        return $this->success([
            'user' => new UserResource($user),
        ], 'Profile retrieved successfully.');
    }

    /**
     * Update user profile.
     * 
     * Allows the authenticated user to update their profile information.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'username' => 'sometimes|required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
            'avatar_url' => 'sometimes|nullable|url|max:500',
        ]);

        $user->update($validated);

        return $this->success([
            'user' => new UserResource($user->fresh()->load('roles', 'driver')),
        ], 'Profile updated successfully.');
    }
}
