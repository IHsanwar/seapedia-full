<?php

namespace App\Http\Requests\Seller\Store;

use Illuminate\Contracts\Validation\ValidationRule;

use Illuminate\Foundation\Http\FormRequest;

class StoreStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name' => 'required|string|max:100|unique:stores,store_name',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // max 2MB
            'banner' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',

        ];
    }
}