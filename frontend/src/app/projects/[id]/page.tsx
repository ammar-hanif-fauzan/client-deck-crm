'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
import { projectsAPI } from '@/lib/api';
import { Project } from '@/lib/store';

const statusLabels = {
  1: 'To Do',
  2: 'In Progress',
  3: 'Completed',
};

const statusColors = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-blue-100 text-blue-800',
  3: 'bg-green-100 text-green-800',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Fetching project with ID:', params.id);
        
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
                console.log('Found project in list:', foundProject);
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
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-20" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
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
                The project you&apos;re looking for doesn&apos;t exist
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
        <div className="flex items-center justify-between">
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
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground">
                Project details and information
              </p>
            </div>
          </div>
          <Button onClick={() => router.push(`/projects/${project.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Button>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Complete details for {project.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Description</span>
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                    {statusLabels[project.status as keyof typeof statusLabels]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Contact</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.contact?.name || 'No contact assigned'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">Last Updated:</span> {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
