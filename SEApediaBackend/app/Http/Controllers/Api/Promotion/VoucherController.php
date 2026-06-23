<?php

namespace App\Http\Controllers\Api\Promotion;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;
use Illuminate\Support\Facades\Auth;

class VoucherController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $vouchers = Voucher::latest()->paginate(10);
        return $this->success($vouchers, 'Vouchers retrieved successfully.');
    }

    public function show($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->error('Voucher not found.', null, 404);
        }

        return $this->success($voucher, 'Voucher retrieved successfully.');
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'code' => 'required|string|unique:vouchers,code',
            'type' => 'required|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'minimum_purchase' => 'nullable|numeric|min:0',
            'remaining_usage' => 'nullable|integer|min:0',
            'expired_at' => 'required|date|after:now',
            'is_active' => 'boolean',
        ]);

        $voucher = Voucher::create($validatedData);

        return $this->success($voucher, 'Voucher created successfully.', 201);
    }

    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->error('Voucher not found.', null, 404);
        }

        $validatedData = $request->validate([
            'code' => 'sometimes|string|unique:vouchers,code,' . $id,
            'type' => 'sometimes|in:fixed,percent',
            'value' => 'sometimes|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'minimum_purchase' => 'nullable|numeric|min:0',
            'remaining_usage' => 'nullable|integer|min:0',
            'expired_at' => 'sometimes|date',
            'is_active' => 'boolean',
        ]);

        $voucher->update($validatedData);

        return $this->success($voucher, 'Voucher updated successfully.');
    }

    public function destroy($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return $this->error('Voucher not found.', null, 404);
        }

        // Check if voucher has been used in orders
        if ($voucher->orders()->exists()) {
            return $this->error('Cannot delete voucher that has been used in orders.', null, 400);
        }

        $voucher->delete();

        return $this->success(null, 'Voucher deleted successfully.');
    }

    /**
     * Get available vouchers for the authenticated buyer
     */
    public function availableVouchers()
    {
        $user = Auth::user();

        $vouchers = Voucher::where('is_active', true)
            ->where('expired_at', '>', now())
            ->where(function ($query) {
                $query->whereNull('remaining_usage')
                      ->orWhere('remaining_usage', '>', 0);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($vouchers, 'Available vouchers retrieved successfully.');
    }
}