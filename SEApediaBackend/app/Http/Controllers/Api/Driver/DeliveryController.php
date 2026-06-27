<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    /**
     * List available delivery jobs
     * Hanya tampilkan job dengan status 'waiting_driver' dan
     * order dengan status 'Menunggu Pengirim' (sesuai lifecycle SEAPEDIA)
     */
    public function jobs(Request $request)
    {
        // Validasi driver profile exists
        if (!$request->user()->driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found. Please complete your driver registration first.',
            ], 403);
        }

        $deliveries = Delivery::query()
            ->where('status', 'waiting_driver')
            ->whereHas('order', function ($query) {
                // Status yang benar sesuai MAIN_TASK.md: "Menunggu Pengirim"
                $query->where('status', 'Menunggu Pengirim');
            })
            ->with([
                'order',
                'order.store',
                'order.address',
                'order.items',
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
     * Menggunakan DB transaction + lockForUpdate untuk mencegah race condition
     * (dua driver tidak bisa ambil job yang sama secara bersamaan)
     */
    public function take(Request $request, Delivery $delivery)
    {
        // Validasi driver profile exists
        $user = $request->user();
        if (!$user->driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found. Please complete your driver registration first.',
            ], 403);
        }

        try {
            $result = DB::transaction(function () use ($delivery, $user) {
                // Lock row untuk mencegah race condition
                $delivery = Delivery::where('id', $delivery->id)
                    ->lockForUpdate()
                    ->first();

                if (!$delivery) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Delivery job not found.',
                    ], 404);
                }

                if ($delivery->status !== 'waiting_driver') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Delivery job is no longer available. Another driver may have taken it.',
                    ], 400);
                }

                $delivery->update([
                    'driver_id' => $user->id,
                    'status'    => 'in_progress',
                    'taken_at'  => now(),
                ]);

                // Timeline order
                OrderStatusHistory::create([
                    'order_id'    => $delivery->order_id,
                    'status'      => 'Sedang Dikirim',
                    'description' => 'Pesanan telah diambil oleh driver.',
                ]);

                // Update status order utama
                $delivery->order->update([
                    'status' => 'Sedang Dikirim',
                ]);

                return $delivery->fresh(['order', 'order.store', 'order.address']);
            });

            // Jika return value adalah Response (error), kembalikan langsung
            if ($result instanceof \Illuminate\Http\JsonResponse) {
                return $result;
            }

            return response()->json([
                'success' => true,
                'message' => 'Delivery job taken successfully.',
                'data'    => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to take job. Please try again.',
            ], 500);
        }
    }

    /**
     * Driver completes delivery
     */
    public function complete(Request $request, Delivery $delivery)
    {
        // Validasi driver profile exists
        if (!$request->user()->driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found.',
            ], 403);
        }

        if ($delivery->driver_id !== $request->user()->id) {
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
            'status'       => 'completed',
            'completed_at' => now(),
        ]);

        // Timeline order
        OrderStatusHistory::create([
            'order_id'    => $delivery->order_id,
            'status'      => 'Pesanan Selesai',
            'description' => 'Pesanan berhasil diterima oleh pembeli.',
        ]);

        // Update status order utama
        $delivery->order->update([
            'status' => 'Pesanan Selesai',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Delivery completed successfully.',
            'data'    => $delivery->fresh(['order', 'order.store', 'order.address']),
        ]);
    }

    /**
     * List all jobs assigned to authenticated driver (active + history)
     */
    public function myJobs(Request $request)
    {
        // Validasi driver profile exists
        if (!$request->user()->driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found. Please complete your driver registration first.',
            ], 403);
        }

        $deliveries = Delivery::query()
            ->where('driver_id', $request->user()->id)
            ->with([
                'order',
                'order.store',
                'order.address',
                'order.items',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Driver jobs retrieved successfully.',
            'data'    => $deliveries,
        ]);
    }
}