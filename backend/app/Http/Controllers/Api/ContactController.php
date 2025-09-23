<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactResource;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class ContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contact::with(['user', 'projects']);
        
        // Jika parameter 'all' tidak ada, filter berdasarkan user_id
        if (!$request->has('all')) {
            $query->where('user_id', $request->user()->id);
        }
        
        $contacts = $query->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            })
            ->get();

        return response()->json([
            'data' => ContactResource::collection($contacts),
            'total' => $contacts->count(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userId = $request->user()->id; // Default to current user

        // Jika user_id diisi, gunakan user yang sudah ada
        if ($request->filled('user_id')) {
            $userId = $request->user_id;
        }
        // Jika name diisi tapi user_id tidak diisi, create user baru
        elseif ($request->filled('name')) {
            $newUser = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make('password'), // Default password
            ]);
            $userId = $newUser->id;
        }

        $contact = Contact::create([
            'user_id' => $userId,
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'company' => $request->company,
        ]);

        return response()->json([
            'message' => 'Contact created successfully',
            'data' => new ContactResource($contact),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Contact $contact): JsonResponse
    {
        // Ensure user can only access their own contacts
        if ($contact->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact->load(['user', 'projects']);

        return response()->json([
            'data' => new ContactResource($contact),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contact $contact): JsonResponse
    {
        // Ensure user can only update their own contacts
        if ($contact->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $userId = $contact->user_id; // Keep current user_id by default

        // Jika user_id diisi, gunakan user yang sudah ada
        if ($request->filled('user_id')) {
            $userId = $request->user_id;
        }
        // Jika name diisi tapi user_id tidak diisi, create user baru
        elseif ($request->filled('name') && !$request->filled('user_id')) {
            $newUser = User::create([
                'name' => $request->name,
                'email' => $request->email ?? $contact->email,
                'password' => Hash::make('password'), // Default password
            ]);
            $userId = $newUser->id;
        }

        $contact->update([
            'user_id' => $userId,
            'name' => $request->name ?? $contact->name,
            'email' => $request->email ?? $contact->email,
            'phone_number' => $request->phone_number ?? $contact->phone_number,
            'company' => $request->company ?? $contact->company,
        ]);

        return response()->json([
            'message' => 'Contact updated successfully',
            'data' => new ContactResource($contact),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Contact $contact): JsonResponse
    {
        // Ensure user can only delete their own contacts
        if ($contact->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $contact->delete();

        return response()->json([
            'message' => 'Contact deleted successfully',
        ]);
    }
}

