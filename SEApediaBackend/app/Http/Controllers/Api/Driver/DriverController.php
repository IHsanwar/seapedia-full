<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function register(Request $request)
    {
        $user = $request->user();

        if ($user->driver) {
            return response()->json([
                'success' => false,
                'message' => 'User is already registered as a driver',
            ], 400);
        }

        $validated = $request->validate([
            'vehicle_type' => 'required|in:motor,mobil,van,truck',
            'vehicle_plate_number' => 'required|string|min:5|max:15',
        ]);

        $driver = $user->driver()->create([
            'name' => $user->name,
            'phone_number' => $user->phone ?? '',
            'vehicle_type' => $validated['vehicle_type'],
            'vehicle_plate_number' => $validated['vehicle_plate_number'],
            'is_active' => true,
        ]);

        $driverRole = Role::where('name', 'driver')->first();
        if ($driverRole && !$user->hasRole('driver')) {
            $user->roles()->attach($driverRole);
        }

        return response()->json([
            'success' => true,
            'message' => 'Driver registered successfully',
            'data' => $driver,
        ]);
    }
    public function DriverProfile(Request $request)
    {
        $user = $request->user();

        if (!$user->driver) {
            return response()->json([
                'success' => false,
                'message' => 'User is not registered as a driver',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Driver profile retrieved successfully',
            'data' => $user->driver,
        ]);
    }
    
}
