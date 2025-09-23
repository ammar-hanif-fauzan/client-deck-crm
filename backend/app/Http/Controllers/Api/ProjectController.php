<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $projects = Project::with(['user', 'contact'])
            ->where('user_id', $request->user()->id)
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->paginate(15);

        return response()->json([
            'data' => ProjectResource::collection($projects),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|integer|in:1,2,3', // 1=To Do, 2=In Progress, 3=Completed
            'contact_id' => 'nullable|exists:contacts,id',
        ]);

        // Ensure contact belongs to the authenticated user
        if ($request->contact_id) {
            $contact = Contact::where('id', $request->contact_id)
                ->where('user_id', $request->user()->id)
                ->first();
            
            if (!$contact) {
                return response()->json(['message' => 'Contact not found or unauthorized'], 404);
            }
        }

        $project = Project::create([
            'user_id' => $request->user()->id,
            'contact_id' => $request->contact_id,
            'name' => $request->name,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Project created successfully',
            'data' => new ProjectResource($project),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Project $project): JsonResponse
    {
        // Ensure user can only access their own projects
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->load(['user', 'contact']);

        return response()->json([
            'data' => new ProjectResource($project),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        // Ensure user can only update their own projects
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|integer|in:1,2,3', // 1=To Do, 2=In Progress, 3=Completed
            'contact_id' => 'nullable|exists:contacts,id',
        ]);

        // Ensure contact belongs to the authenticated user
        if ($request->contact_id) {
            $contact = Contact::where('id', $request->contact_id)
                ->where('user_id', $request->user()->id)
                ->first();
            
            if (!$contact) {
                return response()->json(['message' => 'Contact not found or unauthorized'], 404);
            }
        }

        $project->update([
            'contact_id' => $request->contact_id,
            'name' => $request->name,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Project updated successfully',
            'data' => new ProjectResource($project),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        // Ensure user can only delete their own projects
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}

