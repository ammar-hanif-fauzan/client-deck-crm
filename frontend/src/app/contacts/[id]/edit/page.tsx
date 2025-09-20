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
        const response = await contactsAPI.getById(Number(params.id));
        setContact(response.data);
      } catch (error) {
        console.error('Failed to fetch contact:', error);
        toast.error('Failed to load contact');
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (params.id) {
      fetchContact();
    }
  }, [params.id]);

  const handleSubmit = async (data: ContactFormData) => {
    if (!contact) return;
    
    setIsLoading(true);
    try {
      await contactsAPI.update(contact.id, data);
      toast.success('Contact updated successfully!');
      router.push(`/contacts/${contact.id}`);
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.message || 'Failed to update contact');
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
                The contact you&apos;re trying to edit doesn&apos;t exist
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
