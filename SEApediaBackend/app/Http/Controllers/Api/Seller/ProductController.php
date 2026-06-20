<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\Product\StoreProductRequest;
use App\Http\Requests\Seller\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        $store = Auth::user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found.',
            ], 404);
        }

        $products = $store->products()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
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

    $logo = null;
    $banner = null;

    if ($request->hasFile('logo')) {
        $logo = $request->file('logo')->store('stores/logo', 'public');
    }

    if ($request->hasFile('banner')) {
        $banner = $request->file('banner')->store('stores/banner', 'public');
    }

    $store = Store::create([
        'user_id' => auth()->id(),
        'store_name' => $request->store_name,
        'slug' => Str::slug($request->store_name),
        'description' => $request->description,
        'logo' => $logo,
        'banner' => $banner,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Store created successfully.',
        'data' => new StoreResource($store),
    ], 201);
}
    public function show(string $id)
    {
        $store = Auth::user()->store;
        $product = Product::find($id);

        if (!$store || !$product || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found or unauthorized.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product->load('store')),
        ]);
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

    $data = [
        'store_name' => $request->store_name,
        'slug' => Str::slug($request->store_name),
        'description' => $request->description,
        'is_active' => $request->boolean('is_active'),
    ];

    if ($request->hasFile('logo')) {

        if ($store->logo) {
            Storage::disk('public')->delete($store->logo);
        }

        $data['logo'] = $request->file('logo')->store('stores/logo', 'public');
    }

    if ($request->hasFile('banner')) {

        if ($store->banner) {
            Storage::disk('public')->delete($store->banner);
        }

        $data['banner'] = $request->file('banner')->store('stores/banner', 'public');
    }

    $store->update($data);

    return response()->json([
        'success' => true,
        'message' => 'Store updated successfully.',
        'data' => new StoreResource($store->fresh()),
    ]);
}
    public function destroy(string $id)
    {
        $store = Auth::user()->store;
        $product = Product::find($id);

        if (!$store || !$product || $product->store_id !== $store->id) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found or unauthorized.',
            ], 404);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    private function makeUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'product';
        $slug = $baseSlug;
        $counter = 2;

        while (Product::where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}