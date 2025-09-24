'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserForm } from '@/components/users/UserForm';
import { usersAPI } from '@/lib/api';
import { User } from '@/lib/store';
import { type UserUpdateWithPasswordFormData } from '@/lib/validations';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user for edit with ID:', params.id);
        
        // First try the normal API call
        let response;
        try {
          response = await usersAPI.getById(Number(params.id));
          console.log('User API Response:', response.data);
        } catch (apiError) {
          console.log('Normal API call failed, trying alternative approach...');
          
          // Fallback: try to get user from the list API and filter by ID
          try {
            const listResponse = await usersAPI.getAll({});
            console.log('List API response for fallback:', listResponse.data);
            
            if (listResponse.data && listResponse.data.data && Array.isArray(listResponse.data.data)) {
              const foundUser = listResponse.data.data.find((user: any) => user.id === Number(params.id));
              if (foundUser) {
                console.log('Found user in list for edit:', foundUser);
                setUser(foundUser);
                return;
              }
            }
          } catch (listError) {
            console.error('List API fallback also failed:', listError);
          }
          
          throw apiError; // Re-throw original error if fallback fails
        }
        
        // Handle different response structures from Laravel
        let userData = null;
        if (response.data) {
          if (response.data.data) {
            userData = response.data.data;
          } else {
            userData = response.data;
          }
        }
        
        console.log('Processed user data for edit:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Don't show error toast for 403, just log it
        if ((error as any)?.response?.status !== 403) {
          toast.error('Failed to load user');
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleSubmit = async (data: UserUpdateWithPasswordFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Only include password fields if password is provided
      const updateData: any = {
        name: data.name,
        email: data.email,
      };
      
      if (data.password && data.password.trim() !== '') {
        updateData.password = data.password;
        updateData.password_confirmation = data.password_confirmation;
      }
      
      console.log('Updating user with data:', updateData);
      await usersAPI.update(user.id, updateData);
      toast.success('User updated successfully!');
      router.push(`/users/${user.id}`);
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.message || 'Failed to update user');
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
              <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
              <p className="text-muted-foreground">Loading user information...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
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
              <h1 className="text-3xl font-bold tracking-tight">User Not Found</h1>
              <p className="text-muted-foreground">
                The user you&apos;re trying to edit doesn&apos;t exist
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
            <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
            <p className="text-muted-foreground">
              Update the information for {user.name}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <UserForm 
            user={user} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </AppLayout>
  );
}
