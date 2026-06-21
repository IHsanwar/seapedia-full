<?php

namespace App\Http\Requests\Buyer\Address;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => 'nullable|string|max:50',
            'recipient_name' => 'sometimes|required|string|max:255',
            'recipient_phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string',
            'city' => 'sometimes|required|string|max:100',
            'postal_code' => 'sometimes|required|string|max:10',
            'province' => 'sometimes|required|string|max:100',
            'is_default' => 'boolean',
            'notes' => 'nullable|string',
        ];
    }
}
