<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use \App\Helpers\ApiResponse;

    /**
     * @group Authentication
     * 
     * Register a new buyer.
     * 
     * Registers a new user and automatically assigns the 'buyer' role.
     * Returns the user object along with a Sanctum access token.
     */
    public function register(\App\Http\Requests\Auth\RegisterRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);

        $user = \App\Models\User::create($validated);

        // Assign 'buyer' role by default
        $buyerRole = \App\Models\Role::where('name', 'buyer')->first();
        if ($buyerRole) {
            $user->roles()->attach($buyerRole);
        }

        // Create wallet for the buyer
        \App\Models\Wallet::create([
            'user_id' => $user->id,
            'balance' => 0,
        ]);

        $token = $user->createToken('auth_token', ['role:buyer'])->plainTextToken;

        return $this->success([
            'user' => new \App\Http\Resources\UserResource($user->load('roles', 'driver', 'store')),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'User registered successfully.', 201);
    }

    /**
     * @group Authentication
     * 
     * Login user.
     * 
     * Authenticates a user using email or username and password.
     * Returns the user object along with a Sanctum access token.
     */
    public function login(\App\Http\Requests\Auth\LoginRequest $request)
    {
        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = \App\Models\User::where($loginField, $request->login)->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
            return $this->error('Invalid credentials.', null, 401);
        }

        $roles = $user->roles->pluck('name')->toArray();
        $isAdmin = in_array('admin', $roles);

        $abilities = ['role:none'];

        if ($isAdmin) {
            $abilities = ['role:admin'];
        } else {
            if (in_array('buyer', $roles)) {
                $abilities = ['role:buyer'];
            } else {
                $nonAdminRoles = array_diff($roles, ['admin']);
                if (count($nonAdminRoles) === 1) {
                    $abilities = ['role:' . reset($nonAdminRoles)];
                }
            }
        }

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return $this->success([
            'user' => new \App\Http\Resources\UserResource($user->load('roles', 'driver', 'store')),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'Logged in successfully.');
    }

    /**
     * @group Authentication
     * 
     * Get authenticated user.
     * 
     * Returns the currently authenticated user based on the Bearer token.
     * 
     * @authenticated
     */
    public function me(Request $request)
    {
        return $this->success(
            new \App\Http\Resources\UserResource($request->user()->load('roles', 'driver', 'store')),
            'Authenticated user data retrieved.'
        );
    }

    /**
     * @group Authentication
     * 
     * Switch active role.
     * 
     * Switch the current active role to another role owned by the user.
     * Returns a new access token with the requested role ability.
     * 
     * @authenticated
     */
    public function switchRole(\App\Http\Requests\Auth\SwitchRoleRequest $request)
    {
        $user = $request->user();
        $roleName = $request->role;

        if (!$user->hasRole($roleName)) {
            return $this->error('You do not own this role.', null, 403);
        }

        $request->user()->currentAccessToken()->delete();

        $token = $user->createToken('auth_token', ['role:' . $roleName])->plainTextToken;

        return $this->success([
            'user' => new \App\Http\Resources\UserResource($user->load('roles', 'driver', 'store')),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 'Role switched successfully.');
    }

    /**
     * @group Authentication
     * 
     * Logout user.
     * 
     * Revokes the current user's access token.
     * 
     * @authenticated
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Logged out successfully.');
    }

    /**
     * @group Authentication
     * 
     * Register/Add a new role to the authenticated user.
     * 
     * @authenticated
     */
    public function addRole(Request $request)
    {
        $request->validate([
            'role' => 'required|string|in:buyer,seller,driver'
        ]);

        $user = $request->user();
        $roleName = $request->role;

        // Driver memerlukan pendaftaran khusus dengan data kendaraan.
        // Attach role driver dulu, kemudian frontend akan mengarahkan
        // ke form registrasi driver jika belum ada profil driver.
        if ($roleName === 'driver') {
            $role = \App\Models\Role::where('name', 'driver')->first();
            if ($role && !$user->hasRole('driver')) {
                $user->roles()->attach($role);
            }
            return $this->success([
                'user'              => new \App\Http\Resources\UserResource($user->load('roles', 'driver', 'store')),
                'requires_profile'  => true,
                'registration_url'  => '/driver/register',
            ], 'Driver role assigned. Please complete your driver registration with vehicle details.');
        }

        $role = \App\Models\Role::where('name', $roleName)->first();
        if (!$role) {
            return $this->error('Role not found.', null, 404);
        }

        if (!$user->hasRole($roleName)) {
            $user->roles()->attach($role);
            if ($roleName === 'buyer' && !$user->wallet) {
                \App\Models\Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 0,
                ]);
            }
        }

        return $this->success([
            'user' => new \App\Http\Resources\UserResource($user->load('roles', 'driver', 'store')),
        ], 'Role registered successfully.');
    }
}