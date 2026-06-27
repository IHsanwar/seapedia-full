<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\StoreResource;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;

/**
 * @group Admin Monitoring
 *
 * APIs for monitoring marketplace entities: stores, products, orders, deliveries.
 *
 * @authenticated
 */
class MonitorController extends Controller
{
    use ApiResponse;

    // ─── Stores ─────────────────────────────────────────────

    /**
     * List all stores.
     *
     * Get a paginated list of all stores with owner info.
     */
    public function stores(Request $request)
    {
        $query = Store::with('user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('store_name', 'LIKE', "%{$search}%")
                  ->orWhere('slug', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $stores = $query->latest()->paginate(15);

        return $this->success(
            StoreResource::collection($stores)->response()->getData(true),
            'Stores retrieved successfully.'
        );
    }

    /**
     * Show store detail.
     *
     * Get details of a specific store with its products and owner.
     */
    public function storeDetail(Store $store)
    {
        $store->load(['user', 'products']);

        return $this->success(
            new StoreResource($store),
            'Store retrieved successfully.'
        );
    }

    // ─── Products ───────────────────────────────────────────

    /**
     * List all products.
     *
     * Get a paginated list of all products with store info.
     */
    public function products(Request $request)
    {
        $query = Product::with('store');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'LIKE', "%{$search}%");
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $products = $query->latest()->paginate(15);

        return $this->success(
            ProductResource::collection($products)->response()->getData(true),
            'Products retrieved successfully.'
        );
    }

    // ─── Orders ─────────────────────────────────────────────

    /**
     * List all orders.
     *
     * Get a paginated list of all orders with buyer, store, and delivery info.
     */
    public function orders(Request $request)
    {
        $query = Order::with(['buyer', 'store', 'items', 'delivery', 'statusHistories']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate(15);

        return $this->success(
            OrderResource::collection($orders)->response()->getData(true),
            'Orders retrieved successfully.'
        );
    }

    /**
     * Show order detail.
     *
     * Get full details of a specific order.
     */
    public function orderDetail(Order $order)
    {
        $order->load(['buyer', 'store', 'address', 'items', 'delivery', 'statusHistories', 'voucher', 'promo']);

        return $this->success(
            new OrderResource($order),
            'Order retrieved successfully.'
        );
    }

    // ─── Deliveries ─────────────────────────────────────────

    /**
     * List all deliveries.
     *
     * Get a paginated list of all delivery jobs with order and driver info.
     */
    public function deliveries(Request $request)
    {
        $query = Delivery::with(['order', 'driver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('method')) {
            $query->where('method', $request->method);
        }

        $deliveries = $query->latest()->paginate(15);

        return $this->success(
            DeliveryResource::collection($deliveries)->response()->getData(true),
            'Deliveries retrieved successfully.'
        );
    }

    /**
     * Show delivery detail.
     *
     * Get full details of a specific delivery job.
     */
    public function deliveryDetail(Delivery $delivery)
    {
        $delivery->load(['order.buyer', 'order.store', 'order.items', 'driver']);

        return $this->success(
            new DeliveryResource($delivery),
            'Delivery retrieved successfully.'
        );
    }
}
