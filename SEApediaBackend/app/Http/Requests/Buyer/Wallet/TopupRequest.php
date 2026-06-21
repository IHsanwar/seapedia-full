<?php

namespace App\Http\Requests\Buyer\Wallet;

use Illuminate\Foundation\Http\FormRequest;

class TopupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => 'required|numeric|min:1000|max:10000000',
            'description' => 'nullable|string|max:255',
        ];
    }
}
