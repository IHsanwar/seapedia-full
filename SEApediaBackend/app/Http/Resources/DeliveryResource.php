<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'driver_id' => $this->driver_id,
            'method' => $this->method,
            'fee' => (float) $this->fee,
            'status' => $this->status,
            'taken_at' => $this->taken_at,
            'completed_at' => $this->completed_at,
            'order' => new OrderResource($this->whenLoaded('order')),
            'driver' => new UserResource($this->whenLoaded('driver')),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
