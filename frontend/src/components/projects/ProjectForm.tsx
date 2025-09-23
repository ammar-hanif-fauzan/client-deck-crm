'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectSchema, type ProjectFormData } from '@/lib/validations';
import { Project, Contact } from '@/lib/store';
import { contactsAPI } from '@/lib/api';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectForm({ project, onSubmit, isLoading = false }: ProjectFormProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description,
      status: project.status,
      contact_id: project.contact_id,
    } : {
      status: 1,
    },
  });

  const selectedContactId = watch('contact_id');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await contactsAPI.getAll();
        
        console.log('Contacts API Response:', response.data); // Debug log
        
        // Handle different response structures from Laravel
        let contactsData = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            contactsData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            contactsData = response.data.data;
          } else if (response.data.contacts && Array.isArray(response.data.contacts)) {
            contactsData = response.data.contacts;
          }
        }
        
        setContacts(contactsData);
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{project ? 'Edit Project' : 'Create New Project'}</CardTitle>
        <CardDescription>
          {project ? 'Update the project information below.' : 'Fill in the project information below.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="Enter project name"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Enter project description"
              {...register('description')}
              disabled={isLoading}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')?.toString()}
                onValueChange={(value) => setValue('status', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">To Do</SelectItem>
                  <SelectItem value="2">In Progress</SelectItem>
                  <SelectItem value="3">Completed</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_id">Contact</Label>
              <Select
                value={selectedContactId?.toString()}
                onValueChange={(value) => setValue('contact_id', parseInt(value))}
                disabled={isLoading || contactsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.name} ({contact.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contact_id && (
                <p className="text-sm text-red-600">{errors.contact_id.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isLoading || contactsLoading}>
              {isLoading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
