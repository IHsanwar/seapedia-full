<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
    'user_id',
    'name',
    'phone_number',
    'vehicle_type',
    'vehicle_plate_number',
    'is_active',
];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function deliveries()
    {
        // driver_id di tabel deliveries menyimpan user_id (bukan Driver->id)
        // karena DeliveryController menggunakan auth()->id() saat assign driver
        return $this->hasMany(Delivery::class, 'driver_id', 'user_id');
    }

    public function completedDeliveries()
    {
        return $this->deliveries()->where('status', 'completed');
    }

    public function activeDeliveries()
    {
        return $this->deliveries()->where('status', 'in_progress');
    }

    public function calculateEarnings()
    {
        return $this->completedDeliveries()->sum('fee');
    }
}
