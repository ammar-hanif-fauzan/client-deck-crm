'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, FolderOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { usersAPI, contactsAPI, projectsAPI } from '@/lib/api';

interface DashboardStats {
  total_users: number;
  total_contacts: number;
  total_projects: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, contactsResponse, projectsResponse] = await Promise.all([
          usersAPI.getAll(),
          contactsAPI.getAll(),
          projectsAPI.getAll(),
        ]);

        setStats({
          total_users: usersResponse.data.total || usersResponse.data.data?.length || 0,
          total_contacts: contactsResponse.data.total || contactsResponse.data.data?.length || 0,
          total_projects: projectsResponse.data.total || projectsResponse.data.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Set default values if API fails
        setStats({
          total_users: 0,
          total_contacts: 0,
          total_projects: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color 
  }: {
    title: string;
    value: number;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Mini CRM dashboard. Here&apos;s an overview of your data.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Users"
                value={stats?.total_users || 0}
                description="Registered users in the system"
                icon={Users}
                color="text-blue-600"
              />
              <StatCard
                title="Total Contacts"
                value={stats?.total_contacts || 0}
                description="Contacts in your database"
                icon={UserCheck}
                color="text-green-600"
              />
              <StatCard
                title="Total Projects"
                value={stats?.total_projects || 0}
                description="Active and completed projects"
                icon={FolderOpen}
                color="text-purple-600"
              />
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your CRM system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">System initialized</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Welcome to Mini CRM</p>
                    <p className="text-xs text-muted-foreground">Dashboard loaded</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks you can perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm">Add new contact</span>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm">Create project</span>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <span className="text-sm">Manage users</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
