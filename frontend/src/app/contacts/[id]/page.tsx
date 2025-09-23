'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/AppLayout';
import { contactsAPI } from '@/lib/api';
import { Contact } from '@/lib/store';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        console.log('Fetching contact with ID:', params.id);
        
        // First try the normal API call
        let response;
        try {
          response = await contactsAPI.getById(Number(params.id));
          console.log('Contact API Response:', response.data);
        } catch (apiError) {
          console.log('Normal API call failed, trying alternative approach...');
          
          // Fallback: try to get contact from the list API and filter by ID
          try {
            const listResponse = await contactsAPI.getAll({});
            console.log('List API response for fallback:', listResponse.data);
            
            if (listResponse.data && listResponse.data.data && Array.isArray(listResponse.data.data)) {
              const foundContact = listResponse.data.data.find((contact: any) => contact.id === Number(params.id));
              if (foundContact) {
                console.log('Found contact in list:', foundContact);
                setContact(foundContact);
                return;
              }
            }
          } catch (listError) {
            console.error('List API fallback also failed:', listError);
          }
          
          throw apiError; // Re-throw original error if fallback fails
        }
        
        // Handle different response structures from Laravel
        let contactData = null;
        if (response.data) {
          if (response.data.data) {
            contactData = response.data.data;
          } else {
            contactData = response.data;
          }
        }
        
        setContact(contactData);
      } catch (error) {
        console.error('Failed to fetch contact:', error);
        // Don't show error toast for 403, just log it
        if ((error as any)?.response?.status !== 403) {
          toast.error('Failed to load contact details');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchContact();
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

  if (!contact) {
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
              <h1 className="text-3xl font-bold tracking-tight">Contact Not Found</h1>
              <p className="text-muted-foreground">
                The contact you&apos;re looking for doesn&apos;t exist
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
              <h1 className="text-3xl font-bold tracking-tight">{contact.name}</h1>
              <p className="text-muted-foreground">
                Contact details and information
              </p>
            </div>
          </div>
          <Button onClick={() => router.push(`/contacts/${contact.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Contact
          </Button>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Complete details for {contact.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Company</span>
                  </div>
                  <Badge variant="secondary">{contact.company}</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(contact.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(contact.updated_at).toLocaleDateString()}
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
