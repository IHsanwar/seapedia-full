<?php

namespace App\Http\Requests\Buyer\Order;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voucher_code' => 'nullable|string|exists:vouchers,code',
            'address_id' => 'required|integer|exists:addresses,id',
            'delivery_method' => 'required|in:instant,next_day,regular',
        ];
    }
}