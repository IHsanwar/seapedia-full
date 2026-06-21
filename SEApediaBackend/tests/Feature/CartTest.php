<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Role;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    protected $buyerUser;
    protected $sellerUser;
    protected $anotherSellerUser;
    protected $store;
    protected $anotherStore;
    protected $product1;
    protected $product2;
    protected $anotherStoreProduct;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        $this->seed(RoleSeeder::class);

        $buyerRole = Role::where('name', 'buyer')->first();
        $sellerRole = Role::where('name', 'seller')->first();

        // Create Buyer
        $this->buyerUser = User::create([
            'name' => 'Buyer User',
            'username' => 'buyeruser',
            'email' => 'buyer@example.com',
            'password' => Hash::make('password'),
        ]);
        $this->buyerUser->roles()->attach($buyerRole);

        // Create Seller 1 and Store 1
        $this->sellerUser = User::create([
            'name' => 'Seller User',
            'username' => 'selleruser',
            'email' => 'seller@example.com',
            'password' => Hash::make('password'),
        ]);
        $this->sellerUser->roles()->attach($sellerRole);

        $this->store = Store::create([
            'user_id' => $this->sellerUser->id,
            'store_name' => 'Seller Store One',
            'slug' => 'seller-store-one',
            'is_active' => true,
        ]);

        // Create Products for Store 1
        $this->product1 = Product::create([
            'store_id' => $this->store->id,
            'name' => 'Product One',
            'slug' => 'product-one',
            'description' => 'Description one',
            'price' => 10000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $this->product2 = Product::create([
            'store_id' => $this->store->id,
            'name' => 'Product Two',
            'slug' => 'product-two',
            'description' => 'Description two',
            'price' => 20000,
            'stock' => 5,
            'is_active' => true,
        ]);

        // Create Seller 2 and Store 2
        $this->anotherSellerUser = User::create([
            'name' => 'Seller User Two',
            'username' => 'sellerusertwo',
            'email' => 'seller2@example.com',
            'password' => Hash::make('password'),
        ]);
        $this->anotherSellerUser->roles()->attach($sellerRole);

        $this->anotherStore = Store::create([
            'user_id' => $this->anotherSellerUser->id,
            'store_name' => 'Seller Store Two',
            'slug' => 'seller-store-two',
            'is_active' => true,
        ]);

        $this->anotherStoreProduct = Product::create([
            'store_id' => $this->anotherStore->id,
            'name' => 'Product Store Two',
            'slug' => 'product-store-two',
            'description' => 'Description store two',
            'price' => 15000,
            'stock' => 10,
            'is_active' => true,
        ]);
    }

    public function test_buyer_can_add_product_to_cart()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        $response = $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.store_id', $this->store->id);
        $response->assertJsonCount(1, 'data.items');
        
        $this->assertDatabaseHas('carts', [
            'user_id' => $this->buyerUser->id,
            'store_id' => $this->store->id,
        ]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ]);
    }

    public function test_buyer_cannot_add_product_from_different_store()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        // Add first product from Seller Store One
        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 1,
        ])->assertStatus(200);

        // Attempt to add product from Seller Store Two
        $response = $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->anotherStoreProduct->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertJsonFragment([
            'conflict_store_id' => $this->store->id,
            'conflict_store_name' => $this->store->store_name,
        ]);
        $response->assertSee('Seller Store One');
    }

    public function test_buyer_cannot_add_product_exceeding_stock()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        $response = $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 11, // Stock is 10
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertSee('exceeds the available stock');
    }

    public function test_buyer_can_view_cart_summary()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        // Add product 1 (qty 2, price 10000)
        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ])->assertStatus(200);

        // Add product 2 (qty 1, price 20000)
        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product2->id,
            'quantity' => 1,
        ])->assertStatus(200);

        $response = $this->getJson('/api/v1/buyer/cart');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.summary.total_items', 2);
        $response->assertJsonPath('data.summary.total_quantity', 3);
        $response->assertJsonPath('data.summary.subtotal', 40000);
    }

    public function test_buyer_can_update_cart_item_quantity()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 1,
        ])->assertStatus(200);

        $cart = Cart::where('user_id', $this->buyerUser->id)->first();
        $cartItem = $cart->items()->first();

        $response = $this->putJson("/api/v1/buyer/cart/{$cartItem->id}", [
            'quantity' => 5,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('data.summary.total_quantity', 5);
        
        $this->assertDatabaseHas('cart_items', [
            'id' => $cartItem->id,
            'quantity' => 5,
        ]);
    }

    public function test_buyer_cannot_update_cart_item_quantity_exceeding_stock()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 1,
        ])->assertStatus(200);

        $cart = Cart::where('user_id', $this->buyerUser->id)->first();
        $cartItem = $cart->items()->first();

        $response = $this->putJson("/api/v1/buyer/cart/{$cartItem->id}", [
            'quantity' => 11, // Stock is 10
        ]);

        $response->assertStatus(400);
        $response->assertJsonPath('success', false);
        $response->assertSee('exceeds the available stock');
    }

    public function test_buyer_can_remove_product_from_cart()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 1,
        ])->assertStatus(200);

        $cart = Cart::where('user_id', $this->buyerUser->id)->first();
        $cartItem = $cart->items()->first();

        $this->assertNotNull($cart->store_id);

        $response = $this->deleteJson("/api/v1/buyer/cart/{$cartItem->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(0, 'data.items');
        
        // Assert store_id reset to null
        $cart->refresh();
        $this->assertNull($cart->store_id);

        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItem->id,
        ]);
    }

    public function test_buyer_can_clear_cart()
    {
        Sanctum::actingAs($this->buyerUser, ['role:buyer']);

        $this->postJson('/api/v1/buyer/cart', [
            'product_id' => $this->product1->id,
            'quantity' => 2,
        ])->assertStatus(200);

        $cart = Cart::where('user_id', $this->buyerUser->id)->first();
        $this->assertNotNull($cart->store_id);

        $response = $this->deleteJson('/api/v1/buyer/cart');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(0, 'data.items');
        
        $cart->refresh();
        $this->assertNull($cart->store_id);
        $this->assertEquals(0, $cart->items()->count());
    }

    public function test_seller_cannot_access_cart()
    {
        Sanctum::actingAs($this->sellerUser, ['role:seller']);

        $response = $this->getJson('/api/v1/buyer/cart');
        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_cart()
    {
        $response = $this->getJson('/api/v1/buyer/cart');
        $response->assertStatus(401);
    }
}
