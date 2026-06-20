<?php

namespace App\Http\Requests\Seller\Store;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('stores', 'store_name')->ignore(
                    $this->user()->store?->id
                ),
            ],
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'banner' => 'nullable|string',
            'is_active' => 'boolean',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ];
    }
}