<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'buyer_id' => $this->buyer_id,
            'store_id' => $this->store_id,
            'address_id' => $this->address_id,
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'store' => new StoreResource($this->whenLoaded('store')),
            'address' => new AddressResource($this->whenLoaded('address')),
            'delivery_method' => $this->delivery_method,
            'subtotal' => (float) $this->subtotal,
            'discount' => (float) $this->discount,
            'delivery_fee' => (float) $this->delivery_fee,
            'tax' => (float) $this->tax,
            'total' => (float) $this->total,
            'status' => $this->status,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'status_histories' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}