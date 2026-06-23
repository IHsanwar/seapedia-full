<?php

namespace App\Http\Requests\Seller\Order;

use Illuminate\Foundation\Http\FormRequest;

class ProcessOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|integer|exists:orders,id',
        ];
    }
}