<?php

namespace App\Http\Controllers\Api\Admin;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * @group Admin User Management
 * 
 * APIs for managing users by administrators.
 * 
 * @authenticated
 */
class UserController extends Controller
{
    use ApiResponse;

    /**
     * List all users.
     * 
     * Get a paginated list of all users.
     */
    public function index(Request $request)
    {
        $users = User::with('roles')->paginate(15);
        return $this->success(
            UserResource::collection($users)->response()->getData(true),
            'Users retrieved successfully.'
        );
    }

    /**
     * Create user.
     * 
     * Create a new user with an optional role.
     */
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        if (isset($validated['role'])) {
            $role = Role::where('name', $validated['role'])->first();
            if ($role) {
                $user->roles()->attach($role);
            }
        }

        return $this->success(
            new UserResource($user->load('roles')),
            'User created successfully.',
            201
        );
    }

    /**
     * Show user.
     * 
     * Get details of a specific user.
     */
    public function show(User $user)
    {
        return $this->success(
            new UserResource($user->load('roles')),
            'User retrieved successfully.'
        );
    }

    /**
     * Update user.
     * 
     * Update an existing user's details and optionally change their role.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $validated = $request->validated();
        
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        if (isset($validated['role'])) {
            $role = Role::where('name', $validated['role'])->first();
            if ($role) {
                $user->roles()->sync([$role->id]);
            }
        }

        return $this->success(
            new UserResource($user->load('roles')),
            'User updated successfully.'
        );
    }

    /**
     * Delete user.
     * 
     * Remove a user from the system.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return $this->success(null, 'User deleted successfully.');
    }
}
