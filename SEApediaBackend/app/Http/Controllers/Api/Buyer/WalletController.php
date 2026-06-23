<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Buyer\Wallet\TopupRequest;
use App\Http\Resources\WalletResource;
use App\Http\Resources\WalletTransactionResource;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
            ]);
        }

        return $this->success(
            new WalletResource($wallet->load('transactions')),
            'Wallet retrieved successfully.'
        );
    }

    public function show()
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
            ]);
        }

        return $this->success(
            new WalletResource($wallet),
            'Wallet retrieved successfully.'
        );
    }

    public function transactions()
    {
        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
            ]);
        }

        $transactions = $wallet->transactions()->latest()->get();

        return $this->success(
            WalletTransactionResource::collection($transactions),
            'Wallet transactions retrieved successfully.'
        );
    }

    public function topup(TopupRequest $request)
    {
        $user = Auth::user();

        return DB::transaction(function () use ($user, $request) {
            $wallet = $user->wallet;

            if (!$wallet) {
                $wallet = Wallet::create([
                    'user_id' => $user->id,
                    'balance' => 0,
                ]);
            }

            $amount = $request->amount;

            $wallet->update([
                'balance' => $wallet->balance + $amount,
            ]);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'amount' => $amount,
                'type' => 'topup',
                'description' => $request->description ?? 'Top up wallet',
            ]);

            return $this->success(
                new WalletResource($wallet->fresh()),
                'Wallet topped up successfully.',
                201
            );
        });
    }
}
