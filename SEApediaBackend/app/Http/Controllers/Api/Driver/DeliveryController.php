<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    /**
     * List available delivery jobs
     */
    public function jobs()
    {
        $deliveries = Delivery::query()
            ->where('status', 'waiting_driver')
            ->whereHas('order', function ($query) {
                $query->where('status', 'Menunggu Pengiriman');
            })
            ->with([
                'order',
                'order.store',
                'order.address',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Available jobs retrieved successfully',
            'data' => $deliveries,
        ]);
    }

    /**
     * Driver takes a delivery job
     */
    public function take(Delivery $delivery)
    {
        if ($delivery->status !== 'waiting_driver') {
            return response()->json([
                'success' => false,
                'message' => 'Delivery job is no longer available.',
            ], 400);
        }

        $delivery->update([
            'driver_id' => auth()->id(),
            'status' => 'in_progress',
            'taken_at' => now(),
        ]);

        // Timeline order
        OrderStatusHistory::create([
            'order_id' => $delivery->order_id,
            'status' => 'Sedang Dikirim',
            'description' => 'Pesanan telah diambil oleh driver.',
        ]);

        // Update status order utama
        $delivery->order->update([
            'status' => 'Sedang Dikirim',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery job taken successfully.',
            'data' => $delivery->fresh([
                'order',
            ]),
        ]);
    }

    /**
     * Driver completes delivery
     */
    public function complete(Delivery $delivery)
    {
        if ($delivery->driver_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You are not assigned to this delivery.',
            ], 403);
        }

        if ($delivery->status !== 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Delivery is not currently in progress.',
            ], 400);
        }

        $delivery->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Timeline order
        OrderStatusHistory::create([
            'order_id' => $delivery->order_id,
            'status' => 'Pesanan Selesai',
            'description' => 'Pesanan berhasil diterima oleh pembeli.',
        ]);

        // Update status order utama
        $delivery->order->update([
            'status' => 'Pesanan Selesai',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery completed successfully.',
            'data' => $delivery->fresh([
                'order',
            ]),
        ]);
    }

    /**
     * List jobs currently assigned to authenticated driver
     */
    public function myJobs()
    {
        $deliveries = Delivery::query()
            ->where('driver_id', auth()->id())
            ->with([
                'order',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Driver jobs retrieved successfully.',
            'data' => $deliveries,
        ]);
    }
}