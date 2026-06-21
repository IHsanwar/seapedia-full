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

    public function store(StoreProductRequest $request)
    {
        $store = Auth::user()->store;

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found.',
            ], 404);
        }

        $thumbnail = null;

        if ($request->hasFile('thumbnail_image')) {
            $thumbnail = $request->file('thumbnail_image')
                ->store('products/thumbnail', 'public');
        }

        $product = Product::create([
            'store_id' => $store->id,
            'name' => $request->name,
            'slug' => $this->makeUniqueSlug($request->name),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'thumbnail_image' => $thumbnail,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => new ProductResource($product),
        ], 201);
    }

    public function show(string $id)
    {
        $store = Auth::user()->store;

        $product = Product::where('store_id', $store?->id)
            ->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product->load('store')),
        ]);
    }

    public function update(UpdateProductRequest $request, string $id)
    {
        $store = Auth::user()->store;

        $product = Product::where('store_id', $store?->id)
            ->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $data = $request->only([
            'name',
            'description',
            'price',
            'stock',
        ]);

        if ($request->filled('name')) {
            $data['slug'] = $this->makeUniqueSlug(
                $request->name,
                $product->id
            );
        }

        if ($request->hasFile('thumbnail_image')) {

            if ($product->thumbnail_image) {
                Storage::disk('public')
                    ->delete($product->thumbnail_image);
            }

            $data['thumbnail_image'] = $request
                ->file('thumbnail_image')
                ->store('products/thumbnail', 'public');
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => new ProductResource($product->fresh()),
        ]);
    }

    public function destroy(string $id)
    {
        $store = Auth::user()->store;

        $product = Product::where('store_id', $store?->id)
            ->find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        if ($product->thumbnail_image) {
            Storage::disk('public')
                ->delete($product->thumbnail_image);
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

        while (
            Product::where('slug', $slug)
                ->when(
                    $ignoreId,
                    fn ($query) => $query->where('id', '!=', $ignoreId)
                )
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}