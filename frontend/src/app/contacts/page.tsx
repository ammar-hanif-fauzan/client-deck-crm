'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/AppLayout';
import { contactsAPI } from '@/lib/api';
import { Contact } from '@/lib/store';
import { DeleteContactDialog } from '@/components/contacts/DeleteContactDialog';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      console.log('Fetching contacts with search term:', searchTerm);
      
      // Add page parameter to get all contacts (not just first page)
      const response = await contactsAPI.getAll({ 
        search: searchTerm,
        page: 1 // Explicitly set page to 1
      });
      
      console.log('Contacts API Response:', response.data); // Debug log
      console.log('API URL called:', response.config?.url);
      console.log('Response structure:', {
        isArray: Array.isArray(response.data),
        hasData: !!response.data?.data,
        hasContacts: !!response.data?.contacts,
        keys: response.data ? Object.keys(response.data) : 'no data',
        fullResponse: response.data
      });
      
      // Handle different response structures from Laravel
      let contactsData = [];
      if (response.data) {
        console.log('Processing response.data:', response.data);
        
        // Direct array response
        if (Array.isArray(response.data)) {
          console.log('Found direct array response');
          contactsData = response.data;
        }
        // Laravel Resource with data wrapper (most common)
        else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('Found data.data array');
          contactsData = response.data.data;
        }
        // Custom contacts key
        else if (response.data.contacts && Array.isArray(response.data.contacts)) {
          console.log('Found data.contacts array');
          contactsData = response.data.contacts;
        }
        // Single object (shouldn't happen for getAll, but just in case)
        else if (response.data.id) {
          console.log('Found single object, wrapping in array');
          contactsData = [response.data];
        }
        // Check if response.data itself contains contact-like objects
        else if (typeof response.data === 'object') {
          console.log('Checking for array-like structures in object');
          // Try to find array-like structure
          const possibleArrays = Object.values(response.data).filter(Array.isArray);
          console.log('Found possible arrays:', possibleArrays);
          if (possibleArrays.length > 0) {
            contactsData = possibleArrays[0];
          }
        }
        
        // Additional check: if we still have no data, try to extract from any nested structure
        if (contactsData.length === 0) {
          console.log('No data found, trying to extract from nested structures');
          const extractArrays = (obj: any): any[] => {
            const arrays: any[] = [];
            if (Array.isArray(obj)) {
              arrays.push(obj);
            } else if (obj && typeof obj === 'object') {
              Object.values(obj).forEach(value => {
                arrays.push(...extractArrays(value));
              });
            }
            return arrays;
          };
          
          const allArrays = extractArrays(response.data);
          console.log('All arrays found:', allArrays);
          if (allArrays.length > 0) {
            // Find the largest array (most likely to be the contacts)
            const largestArray = allArrays.reduce((prev, current) => 
              current.length > prev.length ? current : prev
            );
            contactsData = largestArray;
            console.log('Using largest array:', largestArray);
          }
        }
      }
      
      // Fallback: if no contacts found, try to fetch without pagination
      if (contactsData.length === 0) {
        console.log('No contacts found with pagination, trying without page parameter...');
        try {
          const fallbackResponse = await contactsAPI.getAll({ search: searchTerm });
          console.log('Fallback response:', fallbackResponse.data);
          
          if (fallbackResponse.data) {
            if (Array.isArray(fallbackResponse.data)) {
              contactsData = fallbackResponse.data;
            } else if (fallbackResponse.data.data && Array.isArray(fallbackResponse.data.data)) {
              contactsData = fallbackResponse.data.data;
            }
          }
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
        }
      }
      
      console.log('Processed contacts data:', contactsData);
      console.log('Number of contacts found:', contactsData.length);
      setContacts(contactsData);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      console.error('Error details:', error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteClick = (contact: Contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (contactToDelete) {
      try {
        await contactsAPI.delete(contactToDelete.id);
        setContacts(contacts.filter(c => c.id !== contactToDelete.id));
        setDeleteDialogOpen(false);
        setContactToDelete(null);
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  const ContactSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground">
              Manage your contacts and customer information
            </p>
          </div>
          <Link href="/contacts/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Contacts</CardTitle>
            <CardDescription>
              A list of all your contacts and their information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <ContactSkeleton key={i} />
                    ))
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? 'No contacts found matching your search.' : 'No contacts found. Create your first contact to get started.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone_number}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{contact.company}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/contacts/${contact.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/contacts/${contact.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(contact)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <DeleteContactDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          contact={contactToDelete}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </AppLayout>
  );
}
