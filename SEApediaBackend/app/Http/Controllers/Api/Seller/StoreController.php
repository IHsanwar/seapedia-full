<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\Store\StoreStoreRequest;
use App\Http\Requests\Seller\Store\UpdateStoreRequest;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    public function show()
    {
        $store = auth()->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new StoreResource($store),
        ]);
    }

    public function store(StoreStoreRequest $request)
    {
        if (auth()->user()->store) {
            return response()->json([
                'success' => false,
                'message' => 'Store already exists.',
            ], 422);
        }

        // ✅ Handle logo file upload
        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('stores/logos', 'public');
        }

        $store = Store::create([
            'user_id'     => auth()->id(),
            'store_name'  => $request->store_name,
            'slug'        => Str::slug($request->store_name),
            'description' => $request->description,
            'logo'        => $logoPath,
            'phone'       => $request->phone,    // ✅ save phone
            'address'     => $request->address,  // ✅ save address
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Store created successfully.',
            'data'    => new StoreResource($store),
        ], 201);
    }

    public function update(UpdateStoreRequest $request)
    {
        $store = auth()->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found',
            ], 404);
        }

        $logoPath = $store->logo;
        if ($request->hasFile('logo')) {
            // Delete the old logo if it exists
            if ($logoPath) {
                Storage::disk('public')->delete($logoPath);
            }
            $logoPath = $request->file('logo')->store('stores/logos', 'public');
        }

        $store->update([
            'store_name'  => $request->store_name,
            'slug'        => Str::slug($request->store_name),
            'description' => $request->description,
            'logo'        => $logoPath,
            'phone'       => $request->phone,    
            'address'     => $request->address,  
            'is_active'   => $request->boolean('is_active'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Store updated successfully.',
            'data'    => new StoreResource($store->fresh()),
        ]);
    }

    public function destroy()
    {
        $store = auth()->user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found.',
            ], 404);
        }

        if ($store->logo) {
            Storage::disk('public')->delete($store->logo);
        }

        $store->delete();

        return response()->json([
            'success' => true,
            'message' => 'Store deleted successfully.',
        ]);
    }
}