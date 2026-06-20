<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $urlSlug = $this->id . '-' . $this->slug;
        $thumbnailUrl = $this->thumbnail_image
            ? asset('storage/' . $this->thumbnail_image)
            : null;

        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'stock' => $this->stock,
            'thumbnail_image' => $thumbnailUrl,
            'thumbnail_path' => $this->thumbnail_image,
            'image_url' => $thumbnailUrl,
            'slug' => $this->slug,
            'url_slug' => $urlSlug,
            'public_url' => url('/api/v1/products/' . $urlSlug),
            'is_active' => $this->is_active,
            'store' => $this->whenLoaded('store', function () {
                return [
                    'id' => $this->store->id,
                    'store_name' => $this->store->store_name,
                    'slug' => $this->store->slug,
                    'description' => $this->store->description,
                    'logo' => $this->store->logo ? asset('storage/' . $this->store->logo) : null,
                ];
            }),
            'seller' => $this->whenLoaded('store.user', function () {
                return [
                    'id' => $this->store->user->id,
                    'name' => $this->store->user->name,
                    'username' => $this->store->user->username,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}