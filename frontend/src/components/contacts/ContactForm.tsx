'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { contactSchema, type ContactFormData } from '@/lib/validations';
import { Contact, User } from '@/lib/store';
import { usersAPI } from '@/lib/api';

interface ContactFormProps {
  contact?: Contact;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function ContactForm({ contact, onSubmit, isLoading = false }: ContactFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userOption, setUserOption] = useState<'new' | 'existing'>('new');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact ? {
      name: contact.name,
      email: contact.email,
      phone_number: contact.phone_number,
      company: contact.company,
      user_id: contact.user_id || undefined,
    } : {
      userOption: 'new',
    },
  });

  const selectedUserId = watch('user_id');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersAPI.getAll();
        
        console.log('Users API Response:', response.data); // Debug log
        
        // Handle different response structures from Laravel
        let usersData = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            usersData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            usersData = response.data.data;
          } else if (response.data.users && Array.isArray(response.data.users)) {
            usersData = response.data.users;
          }
        }
        
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Set user option based on existing contact
  useEffect(() => {
    if (contact && contact.user_id) {
      setUserOption('existing');
      setValue('user_id', contact.user_id);
    }
  }, [contact, setValue]);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{contact ? 'Edit Contact' : 'Create New Contact'}</CardTitle>
        <CardDescription>
          {contact ? 'Update the contact information below.' : 'Fill in the contact information below.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* User Option Selection - Only show for new contacts */}
          {!contact && (
            <div className="space-y-4">
              <Label className="text-base font-medium">User Management</Label>
              <Select
                value={userOption}
                onValueChange={(value: 'new' | 'existing') => {
                  setUserOption(value);
                  if (value === 'new') {
                    setValue('user_id', undefined);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Create New User (Auto-generate password)</SelectItem>
                  <SelectItem value="existing">Use Existing User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Contact Information</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  {...register('name')}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{(errors.name as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{(errors.email as any)?.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  placeholder="Enter phone number"
                  {...register('phone_number')}
                  disabled={isLoading}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-600">{(errors.phone_number as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  {...register('company')}
                  disabled={isLoading}
                />
                {errors.company && (
                  <p className="text-sm text-red-600">{(errors.company as any)?.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Existing User Selection - Only show when "existing" is selected or editing */}
          {(userOption === 'existing' || contact) && (
            <div className="space-y-2">
              <Label htmlFor="user_id">Select User</Label>
              <Select
                value={selectedUserId?.toString()}
                onValueChange={(value) => setValue('user_id', parseInt(value))}
                disabled={isLoading || usersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.user_id && (
                <p className="text-sm text-red-600">{(errors.user_id as any)?.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isLoading || usersLoading}>
              {isLoading ? 'Saving...' : contact ? 'Update Contact' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
