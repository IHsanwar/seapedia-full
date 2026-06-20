<?php

namespace App\Http\Controllers\Api\Page;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StoreResource;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;

class CatalogueController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with(['store.user'])
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->search}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products),
        ]);
    }

    public function show(string $productSlug)
    {
        $productId = $this->extractProductId($productSlug);

        if (!$productId) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $product = Product::with(['store.user'])->find($productId);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }

    private function extractProductId(string $productSlug): ?int
    {
        if (!preg_match('/^(\d+)(?:-.+)?$/', $productSlug, $matches)) {
            return null;
        }

        return (int) $matches[1];
    }

    public function showStore(string $storeSlug)
    {
        $store = Store::with(['user', 'products' => function ($query) {
            $query->where('is_active', true)->latest();
        }])->where('slug', $storeSlug)->first();

        if (!$store) {
            return response()->json([
                'success' => false,
                'message' => 'Store not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new StoreResource($store),
        ]);
    }
}