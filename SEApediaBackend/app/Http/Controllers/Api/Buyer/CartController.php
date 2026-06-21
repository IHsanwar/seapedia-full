<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Buyer\Cart\AddCartItemRequest;
use App\Http\Requests\Buyer\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Http\Resources\CartItemResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Support\Facades\Auth;

/**
 * @group Buyer Cart Management
 *
 * Endpoints for managing the buyer's shopping cart.
 */
class CartController extends Controller
{
    use ApiResponse;

    /**
     * View Cart Summary
     *
     * Retrieve the authenticated buyer's cart, including all items and summary statistics.
     *
     * @authenticated
     */
    public function index()
    {
        $user = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // Load items with product details and store details
        $cart->load(['store', 'items.product.store']);

        return $this->success(
            new CartResource($cart),
            'Cart retrieved successfully.'
        );
    }

    /**
     * Add Product to Cart
     *
     * Add a product to the authenticated buyer's cart. Enforces the single-store checkout constraint.
     *
     * @authenticated
     */
    public function store(AddCartItemRequest $request)
    {
        $user = Auth::user();
        $product = Product::find($request->product_id);

        if (!$product) {
            return $this->error('Product not found.', null, 404);
        }

        if (!$product->is_active) {
            return $this->error('Product is not active.', null, 400);
        }

        // Get or create cart
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        // If the cart has no items, reset store_id to null
        if ($cart->items()->count() === 0 && $cart->store_id !== null) {
            $cart->store_id = null;
            $cart->save();
        }

        // Enforce Single Store Checkout rule
        if ($cart->store_id !== null && $cart->store_id !== $product->store_id) {
            $conflictStore = Store::find($cart->store_id);
            $conflictStoreName = $conflictStore ? $conflictStore->store_name : 'another store';
            return $this->error(
                "Your cart already contains products from \"{$conflictStoreName}\". You can only add products from one store at a time. Please clear your cart first.",
                [
                    'conflict_store_id' => $cart->store_id,
                    'conflict_store_name' => $conflictStoreName,
                ],
                400
            );
        }

        // Get existing cart item if any
        $cartItem = $cart->items()->where('product_id', $product->id)->first();
        $currentQty = $cartItem ? $cartItem->quantity : 0;
        $newQty = $currentQty + $request->quantity;

        // Check stock availability
        if ($newQty > $product->stock) {
            return $this->error(
                "The requested quantity exceeds the available stock. Current stock is {$product->stock}.",
                null,
                400
            );
        }

        // Update cart store_id if it was null
        if ($cart->store_id === null) {
            $cart->store_id = $product->store_id;
            $cart->save();
        }

        if ($cartItem) {
            $cartItem->quantity = $newQty;
            $cartItem->save();
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        $cart->load(['store', 'items.product.store']);

        return $this->success(
            new CartResource($cart),
            'Product added to cart successfully.',
            200
        );
    }

    /**
     * Update Cart Item Quantity
     *
     * Update the quantity of a specific item in the cart.
     *
     * @authenticated
     */
    public function update(UpdateCartItemRequest $request, string $id)
    {
        $user = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $cartItem = $cart->items()->find($id);

        if (!$cartItem) {
            return $this->error('Cart item not found.', null, 404);
        }

        $product = $cartItem->product;
        if (!$product) {
            return $this->error('Product not found.', null, 404);
        }

        $newQty = $request->quantity;

        // Check stock availability
        if ($newQty > $product->stock) {
            return $this->error(
                "The requested quantity exceeds the available stock. Current stock is {$product->stock}.",
                null,
                400
            );
        }

        $cartItem->quantity = $newQty;
        $cartItem->save();

        $cart->load(['store', 'items.product.store']);

        return $this->success(
            new CartResource($cart),
            'Cart item quantity updated successfully.'
        );
    }

    /**
     * Remove Product from Cart
     *
     * Delete a specific item from the cart.
     *
     * @authenticated
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $cartItem = $cart->items()->find($id);

        if (!$cartItem) {
            return $this->error('Cart item not found.', null, 404);
        }

        $cartItem->delete();

        // If cart is empty now, reset store_id to null
        if ($cart->items()->count() === 0) {
            $cart->store_id = null;
            $cart->save();
        }

        $cart->load(['store', 'items.product.store']);

        return $this->success(
            new CartResource($cart),
            'Product removed from cart successfully.'
        );
    }

    /**
     * Clear Cart
     *
     * Remove all products from the cart and reset the store constraint.
     *
     * @authenticated
     */
    public function clear()
    {
        $user = Auth::user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $cart->items()->delete();
        $cart->store_id = null;
        $cart->save();

        $cart->load(['store', 'items.product.store']);

        return $this->success(
            new CartResource($cart),
            'Cart cleared successfully.'
        );
    }
}
