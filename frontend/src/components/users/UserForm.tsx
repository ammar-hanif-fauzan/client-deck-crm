'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { userCreateSchema, userUpdateSchema, type UserCreateFormData, type UserUpdateFormData } from '@/lib/validations';
import { User } from '@/lib/store';

interface UserFormProps {
  user?: User;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function UserForm({ user, onSubmit, isLoading = false }: UserFormProps) {
  const isEdit = !!user;
  const schema = isEdit ? userUpdateSchema : userCreateSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
    } : undefined,
  });

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{user ? 'Edit User' : 'Create New User'}</CardTitle>
        <CardDescription>
          {user ? 'Update the user information below.' : 'Fill in the user information below.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {!isEdit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{(errors.password as any)?.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Confirm password"
                  {...register('password_confirmation')}
                  disabled={isLoading}
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-600">{(errors.password_confirmation as any)?.message}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
