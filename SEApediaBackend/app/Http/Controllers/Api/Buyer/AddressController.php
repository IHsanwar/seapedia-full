<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Buyer\Address\StoreAddressRequest;
use App\Http\Requests\Buyer\Address\UpdateAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Support\Facades\Auth;

class AddressController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $addresses = Auth::user()->addresses()->latest()->get();

        return $this->success(
            AddressResource::collection($addresses),
            'Addresses retrieved successfully.'
        );
    }

    public function store(StoreAddressRequest $request)
    {
        $user = Auth::user();

        $data = $request->validated();

        if ($data['is_default']) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($data);

        return $this->success(
            new AddressResource($address),
            'Address created successfully.',
            201
        );
    }

    public function show(string $id)
    {
        $address = Auth::user()->addresses()->find($id);

        if (!$address) {
            return $this->error('Address not found.', null, 404);
        }

        return $this->success(
            new AddressResource($address),
            'Address retrieved successfully.'
        );
    }

    public function update(UpdateAddressRequest $request, string $id)
    {
        $user = Auth::user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return $this->error('Address not found.', null, 404);
        }

        $data = $request->validated();

        if (isset($data['is_default']) && $data['is_default']) {
            $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return $this->success(
            new AddressResource($address->fresh()),
            'Address updated successfully.'
        );
    }

    public function destroy(string $id)
    {
        $address = Auth::user()->addresses()->find($id);

        if (!$address) {
            return $this->error('Address not found.', null, 404);
        }

        $address->delete();

        return $this->success(
            null,
            'Address deleted successfully.'
        );
    }

    public function setDefault(string $id)
    {
        $user = Auth::user();
        $address = $user->addresses()->find($id);

        if (!$address) {
            return $this->error('Address not found.', null, 404);
        }

        $user->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return $this->success(
            new AddressResource($address->fresh()),
            'Default address set successfully.'
        );
    }
}
