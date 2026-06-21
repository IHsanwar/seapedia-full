<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items;
        
        $subtotal = 0.0;
        $totalQuantity = 0;
        
        foreach ($items as $item) {
            $price = $item->product ? (float) $item->product->price : 0.0;
            $qty = (int) $item->quantity;
            $subtotal += $price * $qty;
            $totalQuantity += $qty;
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'store_id' => $this->store_id,
            'store' => new StoreResource($this->whenLoaded('store')),
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'summary' => [
                'total_items' => $items->count(),
                'total_quantity' => $totalQuantity,
                'subtotal' => $subtotal,
            ],
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
