<?php

namespace App\Http\Controllers\Api\Page;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
    public function index()
    {
        try {
            // Ambil semua review dengan user yang sudah join dan belum join
            $reviews = Review::latest() // Terbaru di atas
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Reviews retrieved successfully',
                'data' => $reviews,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve reviews',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'reviewer_name' => 'required|string|max:100',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string',
            ]);

            // Buat review (user_id bisa null untuk guest)
            $review = Review::create([
                'user_id' => auth('sanctum')->id(), // null jika tidak login
                'reviewer_name' => $validated['reviewer_name'],
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data' => $review,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
            ], 500);
        }
    }
}
