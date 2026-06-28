<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * UserResource
 *
 * Transforms a User model into a consistent JSON structure.
 * Sensitive fields (password, remember_token) are excluded.
 * Roles are included only when the relationship is eagerly loaded.
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $activeRole = null;
        if ($request->user() && $request->user()->currentAccessToken()) {
            $abilities = $request->user()->currentAccessToken()->abilities;
            foreach ($abilities as $ability) {
                if (str_starts_with($ability, 'role:')) {
                    $activeRole = str_replace('role:', '', $ability);
                    break;
                }
            }
        }

        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'username'           => $this->username,
            'email'              => $this->email,
            'phone'              => $this->phone,
            'avatar_url'         => $this->avatar_url,
            'active_role'        => $activeRole,
            'roles'              => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()),
            // Flag untuk frontend: apakah user sudah terdaftar di tabel drivers
            'has_driver_profile' => $this->driver !== null,
            'has_store'          => $this->store !== null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
