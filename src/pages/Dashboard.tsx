import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Package, TruckIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { userRole, user } = useAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
      document.title = 'Dashboard';
    fetchStats();
  }, [user, userRole]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      if (userRole === 'customer') {
        // Fetch customer statistics
        const [warehouseResult, transportResult] = await Promise.all([
          supabase
            .from('warehouse_requests')
            .select('status')
            .eq('customer_id', user.id),
          supabase
            .from('transportation_requests')
            .select('status')
            .eq('customer_id', user.id),
        ]);

        const allRequests = [
          ...(warehouseResult.data || []),
          ...(transportResult.data || []),
        ];

        setStats({
          totalRequests: allRequests.length,
          pending: allRequests.filter(r => r.status === 'pending').length,
          approved: allRequests.filter(r => r.status === 'approved').length,
          rejected: allRequests.filter(r => r.status === 'rejected').length,
        });
      } else {
        // Fetch ops statistics
        const [warehouseResult, transportResult] = await Promise.all([
          supabase.from('warehouse_requests').select('status'),
          supabase.from('transportation_requests').select('status'),
        ]);

        const allRequests = [
          ...(warehouseResult.data || []),
          ...(transportResult.data || []),
        ];

        setStats({
          totalRequests: allRequests.length,
          pending: allRequests.filter(r => r.status === 'pending').length,
          approved: allRequests.filter(r => r.status === 'approved').length,
          rejected: allRequests.filter(r => r.status === 'rejected').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          {/*<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>*/}
          <p className="text-muted-foreground">
            {userRole === 'ops' 
              ? ''
              : 'Overview of your service requests'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
