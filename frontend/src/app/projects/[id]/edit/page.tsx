'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { projectsAPI } from '@/lib/api';
import { Project } from '@/lib/store';
import { type ProjectFormData } from '@/lib/validations';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Fetching project for edit with ID:', params.id);
        
        // First try the normal API call
        let response;
        try {
          response = await projectsAPI.getById(Number(params.id));
          console.log('Project API Response:', response.data);
        } catch (apiError) {
          console.log('Normal API call failed, trying alternative approach...');
          
          // Fallback: try to get project from the list API and filter by ID
          try {
            const listResponse = await projectsAPI.getAll({});
            console.log('List API response for fallback:', listResponse.data);
            
            if (listResponse.data && listResponse.data.data && Array.isArray(listResponse.data.data)) {
              const foundProject = listResponse.data.data.find((project: any) => project.id === Number(params.id));
              if (foundProject) {
                console.log('Found project in list for edit:', foundProject);
                setProject(foundProject);
                return;
              }
            }
          } catch (listError) {
            console.error('List API fallback also failed:', listError);
          }
          
          throw apiError; // Re-throw original error if fallback fails
        }
        
        // Handle different response structures from Laravel
        let projectData = null;
        if (response.data) {
          if (response.data.data) {
            projectData = response.data.data;
          } else {
            projectData = response.data;
          }
        }
        
        setProject(projectData);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        // Don't show error toast for 403, just log it
        if ((error as any)?.response?.status !== 403) {
          toast.error('Failed to load project');
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const handleSubmit = async (data: ProjectFormData) => {
    if (!project) return;
    
    setIsLoading(true);
    try {
      await projectsAPI.update(project.id, data);
      toast.success('Project updated successfully!');
      router.push(`/projects/${project.id}`);
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.message || 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" disabled>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
              <p className="text-muted-foreground">Loading project information...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Not Found</h1>
              <p className="text-muted-foreground">
                The project you&apos;re trying to edit doesn&apos;t exist
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">
              Update the information for {project.name}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ProjectForm 
            project={project} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </AppLayout>
  );
}
