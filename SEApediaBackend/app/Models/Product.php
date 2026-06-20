<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'name',
        'description',
        'price',
        'stock',
        'thumbnail_image',
        'slug',
        'is_active',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
