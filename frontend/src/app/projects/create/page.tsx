'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { projectsAPI } from '@/lib/api';
import { type ProjectFormData } from '@/lib/validations';

export default function CreateProjectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      await projectsAPI.create(data);
      toast.success('Project created successfully!');
      router.push('/projects');
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
            <p className="text-muted-foreground">
              Add a new project to your CRM system
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ProjectForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </AppLayout>
  );
}
