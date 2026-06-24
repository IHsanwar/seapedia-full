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
}
