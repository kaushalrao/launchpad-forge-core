import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/lib/supabase';
import { Package, TruckIcon, Search, ArrowRight, CalendarIcon, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function TrackRequests() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
      document.title = 'Requests';
    fetchOrders();
  }, [user, userRole]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const query = userRole === 'customer'
        ? {customer_id: user.id }
        : {};

      const [warehouseResult, transportResult] = await Promise.all([
        supabase
          .from('warehouse_requests')
          .select('*, companies(name)')
          .match(query)
          .order('created_at', { ascending: false }),
        supabase
          .from('transportation_requests')
          .select('*, companies(name)')
          .match(query)
          .order('created_at', { ascending: false }),
      ]);

      const allOrders = [
        ...(warehouseResult.data || []).map(o => ({ ...o, type: 'warehouse' })),
        ...(transportResult.data || []).map(o => ({ ...o, type: 'transportation' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, type: string, newStatus: string) => {
    try {
      const table = type === 'warehouse' ? 'warehouse_requests' : 'transportation_requests';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Request ${newStatus} successfully`);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const filteredOrders = orders
    .filter(order => {
      // Search filter
      if (!order.reference.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Request type filter
      if (requestTypeFilter !== 'all' && order.type !== requestTypeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Date filter
      const orderDate = new Date(order.created_at);
      if (dateFrom && orderDate < dateFrom) {
        return false;
      }
      if (dateTo && orderDate > dateTo) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status-asc':
          return a.status.localeCompare(b.status);
        case 'status-desc':
          return b.status.localeCompare(a.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'approved':
        return 'bg-success/10 text-success border-success/20';
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'completed':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading requests...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            {/*<h1 className="text-3xl font-bold tracking-tight">Requests</h1>*/}
            <p className="text-muted-foreground">
              {userRole === 'ops' 
                ? ''
                : 'View and track your service requests'}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters and Sort */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters & Sort</span>

                  <div className="flex items-center gap-2">
                      {/* Clear Filters Button */}
                      {(dateFrom || dateTo || requestTypeFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'date-desc') && (
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                  setDateFrom(undefined);
                                  setDateTo(undefined);
                                  setRequestTypeFilter('all');
                                  setStatusFilter('all');
                                  setSortBy('date-desc');
                              }}
                              className="w-fit"
                          >
                              Clear All Filters
                          </Button>
                      )}
                  </div>
              </div>




              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Date From */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Date From</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Date To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Request Type */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Request Type</label>
                  <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="loaded">Loaded</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="pod_received">POD Received</SelectItem>
                      <SelectItem value="completed">Complete</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          Date (Newest First)
                        </div>
                      </SelectItem>
                      <SelectItem value="date-asc">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          Date (Oldest First)
                        </div>
                      </SelectItem>
                      <SelectItem value="status-asc">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          Status (A-Z)
                        </div>
                      </SelectItem>
                      <SelectItem value="status-desc">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-4 w-4" />
                          Status (Z-A)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No Requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${order.type === 'warehouse' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                        {order.type === 'warehouse' ? (
                          <Package className={`h-6 w-6 ${order.type === 'warehouse' ? 'text-primary' : 'text-accent'}`} />
                        ) : (
                          <TruckIcon className="h-6 w-6 text-accent" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{order.reference}</h3>
                          <Badge variant="outline" className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {order.type === 'warehouse' ? 'Warehouse Service' : 'Transportation Service'}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          {order.type === 'warehouse' ? (
                            <>
                              <div>
                                <span className="text-muted-foreground">From: </span>
                                <span className="font-medium">{order.from_date}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">To: </span>
                                <span className="font-medium">{order.to_date}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Area: </span>
                                <span className="font-medium">{order.area_required} sq m</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <span className="text-muted-foreground">Mode: </span>
                                <span className="font-medium">{order.mode}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Date: </span>
                                <span className="font-medium">{order.transport_date}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">From: </span>
                                <span className="font-medium">{order.source_city}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">To: </span>
                                <span className="font-medium">{order.destination_city}</span>
                              </div>
                            </>
                          )}
                        </div>
                        
                        {userRole === 'customer' && order.companies && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Provider: {order.companies.name}
                          </p>
                        )}
                        
                        {userRole === 'ops' && order.profiles && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Customer: {order.profiles.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/request/${order.type}/${order.id}`)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
