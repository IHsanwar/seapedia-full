<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        return [
            'login' => ['required'],
            'password' => ['required'],
            'cf-turnstile-response' => ['required', 'string'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'login.required' => 'Username or email is required.',
            'password.required' => 'Password is required.',
            'cf-turnstile-response.required' => 'Captcha verification is required.',
        ];
    }
}