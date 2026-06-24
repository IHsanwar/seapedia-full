<?php

namespace App\Http\Controllers\Api\Seller;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Seller\Order\ProcessOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $store = Auth::user()->store;

        if (!$store) {
            return $this->error('Store not found.', null, 404);
        }

        $orders = $store->orders()->with(['items.product', 'buyer', 'address', 'statusHistories'])->latest()->get();

        return $this->success(
            OrderResource::collection($orders),
            'Orders retrieved successfully.'
        );
    }

    public function show(string $id)
    {
        $store = Auth::user()->store;

        if (!$store) {
            return $this->error('Store not found.', null, 404);
        }

        $order = $store->orders()->with(['items.product', 'buyer', 'address', 'statusHistories'])->find($id);

        if (!$order) {
            return $this->error('Order not found.', null, 404);
        }

        return $this->success(
            new OrderResource($order),
            'Order retrieved successfully.'
        );
    }

    public function process(ProcessOrderRequest $request)
    {
        $store = Auth::user()->store;

        if (!$store) {
            return $this->error('Store not found.', null, 404);
        }

        $order = $store->orders()->find($request->order_id);

        if (!$order) {
            return $this->error('Order not found.', null, 404);
        }

        if ($order->status !== 'Sedang Dikemas') {
            return $this->error('Order can only be processed when status is "Sedang Dikemas".', null, 400);
        }

        return DB::transaction(function () use ($order) {
            $order->update([
                'status' => 'Menunggu Pengiriman',
            ]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'Menunggu Pengiriman',
                'note' => 'Order processed by seller',
            ]);

            $order->load(['items.product', 'buyer', 'address', 'statusHistories']);

            return $this->success(
                new OrderResource($order),
                'Order processed successfully.'
            );
        });
    }
}