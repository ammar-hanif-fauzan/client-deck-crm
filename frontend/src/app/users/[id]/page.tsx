'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Mail, Calendar, User as UserIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
import { usersAPI } from '@/lib/api';
import { User } from '@/lib/store';
import { toast } from 'sonner';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('Fetching user with ID:', params.id);
        
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
                console.log('Found user in list:', foundUser);
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
        
        console.log('Processed user data:', userData);
        // Debug: Log email_verified_at value
        if (userData) {
          console.log(`User (${userData.name}): email_verified_at =`, userData.email_verified_at, 'Type:', typeof userData.email_verified_at);
        }
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleVerifyUser = async () => {
    if (!user) return;
    
    setIsVerifying(true);
    try {
      await usersAPI.verify(user.id);
      toast.success('User verified successfully!');
      
      // Refresh user data with fallback mechanism
      console.log('Refreshing user data after verify...');
      let response;
      try {
        response = await usersAPI.getById(user.id);
        console.log('User API Response after verify:', response.data);
      } catch (apiError) {
        console.log('Normal API call failed after verify, trying alternative approach...');
        
        // Fallback: try to get user from the list API and filter by ID
        try {
          const listResponse = await usersAPI.getAll({});
          console.log('List API response for fallback after verify:', listResponse.data);
          
          if (listResponse.data && listResponse.data.data && Array.isArray(listResponse.data.data)) {
            const foundUser = listResponse.data.data.find((user: any) => user.id === Number(params.id));
            if (foundUser) {
              console.log('Found updated user in list after verify:', foundUser);
              setUser(foundUser);
              return;
            }
          }
        } catch (listError) {
          console.error('List API fallback also failed after verify:', listError);
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
      
      console.log('Processed user data after verify:', userData);
      setUser(userData);
      
      // Dispatch event to refresh users list
      window.dispatchEvent(new CustomEvent('userVerified'));
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.message || 'Failed to verify user');
    } finally {
      setIsVerifying(false);
    }
  };

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
                The user you&apos;re looking for doesn&apos;t exist
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
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground">
                User details and information
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {(!user.email_verified_at || user.email_verified_at === null) && (
              <Button 
                variant="outline" 
                onClick={handleVerifyUser}
                disabled={isVerifying}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isVerifying ? 'Verifying...' : 'Verify User'}
              </Button>
            )}
            <Button onClick={() => router.push(`/users/${user.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Complete details for {user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Name</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge variant={user.email_verified_at && user.email_verified_at !== null ? "default" : "secondary"}>
                    {user.email_verified_at && user.email_verified_at !== null ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      <span className="font-medium">Last Updated:</span> {new Date(user.updated_at).toLocaleDateString()}
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
