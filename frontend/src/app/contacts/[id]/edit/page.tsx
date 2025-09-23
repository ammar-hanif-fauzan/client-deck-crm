'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ContactForm } from '@/components/contacts/ContactForm';
import { contactsAPI } from '@/lib/api';
import { Contact } from '@/lib/store';
import { type ContactFormData } from '@/lib/validations';

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        console.log('Fetching contact for edit with ID:', params.id);
        
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
                console.log('Found contact in list for edit:', foundContact);
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
          toast.error('Failed to load contact');
        }
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (params.id) {
      fetchContact();
    }
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    if (!contact) return;
    
    setIsLoading(true);
    try {
      // Prepare data for API - only include user_id if it's provided
      const contactData: any = {
        name: data.name,
        email: data.email,
        phone_number: data.phone_number,
        company: data.company,
      };
      
      // Only add user_id if it's provided
      if (data.user_id) {
        contactData.user_id = data.user_id;
      }
      
      console.log('Updating contact with data:', contactData); // Debug log
      
      await contactsAPI.update(contact.id, contactData);
      toast.success('Contact updated successfully!');
      router.push(`/contacts/${contact.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update contact');
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
              <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
              <p className="text-muted-foreground">Loading contact information...</p>
            </div>
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
                The contact you're trying to edit doesn't exist
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
            <p className="text-muted-foreground">
              Update the information for {contact.name}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ContactForm 
            contact={contact} 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </AppLayout>
  );
}
