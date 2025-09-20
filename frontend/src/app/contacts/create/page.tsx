'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { ContactForm } from '@/components/contacts/ContactForm';
import { contactsAPI } from '@/lib/api';
import { type ContactFormData } from '@/lib/validations';

export default function CreateContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      await contactsAPI.create(data);
      toast.success('Contact created successfully!');
      router.push('/contacts');
    } catch (error: unknown) {
      toast.error((error as any)?.response?.data?.message || 'Failed to create contact');
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
            <h1 className="text-3xl font-bold tracking-tight">Create Contact</h1>
            <p className="text-muted-foreground">
              Add a new contact to your CRM system
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <ContactForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </AppLayout>
  );
}
