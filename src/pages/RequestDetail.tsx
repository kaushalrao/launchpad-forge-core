import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Package, TruckIcon, ArrowLeft, Calendar, MapPin, User, ShieldCheck, FileText, Truck, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransportStatusTimeline } from '@/components/TransportStatusTimeline';

export default function RequestDetail() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [statusData, setStatusData] = useState<any>({
    driver_name: '',
    driver_mobile: '',
    vehicle_number: '',
    vehicle_model: '',
    tracking_ref: '',
    tracking_link: '',
    loading_proof: null,
    pod_proof: null,
    vendor_name: '',
    vehicle_type: '',
  });

  useEffect(() => {
    if (id && type) {
      fetchRequestDetails();
    }
  }, [id, type]);

  const fetchRequestDetails = async () => {
    try {
      const table = type === 'warehouse' ? 'warehouse_requests' : 'transportation_requests';
      const itemsTable = type === 'warehouse' ? 'warehouse_request_items' : 'transportation_request_items';
      
      // Fetch request data
      const { data: requestData, error: requestError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (requestError) throw requestError;
      if (!requestData) {
        setRequest(null);
        setLoading(false);
        return;
      }

      // Create extended request object
      const extendedRequest: any = { ...requestData };

      // Fetch related data separately
      if (requestData.provider_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('name')
          .eq('id', requestData.provider_id)
          .maybeSingle();
        
        if (companyData) {
          extendedRequest.companies = companyData;
        }
      }

      if (requestData.customer_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', requestData.customer_id)
          .maybeSingle();
        
        if (profileData) {
          extendedRequest.profiles = profileData;
        }
      }

      setRequest(extendedRequest);

      // Fetch items
      const idColumn = type === 'warehouse' ? 'warehouse_request_id' : 'transportation_request_id';
      const itemsQuery = await (supabase
        .from(itemsTable as any)
        .select('id, item_name, item_code, item_description, quantity, uom, weight, dimension, hazardous, fragile')
        .eq(idColumn, id as string));

      setItems((itemsQuery.data as any[]) || []);
    } catch (error: any) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (status: string) => {
    const requiresDialog = ['assigned', 'loaded', 'pod_received', 'in_transit'];
    if (requiresDialog.includes(status)) {
      setSelectedStatus(status);
      setStatusDialogOpen(true);
    } else {
      updateStatus(status);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStatusData((prev: any) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateStatus = async (newStatus: string, additionalData?: any) => {
    try {
      const table = type === 'warehouse' ? 'warehouse_requests' : 'transportation_requests';
      const updateData: any = { status: newStatus };

      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Send email notification for specific status changes
      const emailStatusMap: Record<string, 'submission' | 'approved' | 'rejected'> = {
        'submitted': 'submission',
        'approved': 'approved',
        'rejected': 'rejected',
      };

      if (request?.profiles?.email && emailStatusMap[newStatus]) {
        await supabase.functions.invoke('send-request-email', {
          body: {
            to: request.profiles.email,
            customerName: request.profiles.name,
            reference: request.reference,
            type: emailStatusMap[newStatus],
            serviceType: type,
          },
        });
      }

      toast.success(`Request ${newStatus} successfully`);
      setStatusDialogOpen(false);
      setStatusData({
        driver_name: '',
        driver_mobile: '',
        vehicle_number: '',
        vehicle_model: '',
        tracking_ref: '',
        tracking_link: '',
        loading_proof: null,
        pod_proof: null,
        vendor_name: '',
        vehicle_type: '',
      });
      fetchRequestDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleStatusDialogSubmit = () => {
    const additionalData: any = {};

    if (selectedStatus === 'assigned') {
      additionalData.driver_name = statusData.driver_name;
      additionalData.driver_mobile = statusData.driver_mobile;
      additionalData.vehicle_number = statusData.vehicle_number;
      additionalData.vehicle_model = statusData.vehicle_model;
      additionalData.vendor_name = statusData.vendor_name;
      additionalData.vehicle_type = statusData.vehicle_type;
    } else if (selectedStatus === 'loaded') {
      additionalData.loading_proof_url = statusData.loading_proof;
    } else if (selectedStatus === 'pod_received') {
      additionalData.pod_proof_url = statusData.pod_proof;
    } else if (selectedStatus === 'in_transit') {
      additionalData.tracking_ref = statusData.tracking_ref;
      additionalData.tracking_link = statusData.tracking_link;
    }

    updateStatus(selectedStatus, additionalData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
      case 'submitted':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'assigned':
      case 'ready_for_pickup':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'arrived_at_pickup':
      case 'loaded':
      case 'in_transit':
      case 'arrived_at_hub':
      case 'departed_from_hub':
      case 'arrived_at_destination':
      case 'unloading':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'delivered':
      case 'pod_received':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20';
      case 'completed':
      case 'billed':
      case 'closed':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getNextStatuses = (currentStatus: string) => {
    const statusFlow: Record<string, string[]> = {
      submitted: ['approved', 'rejected'],
      approved: ['assigned'],
      assigned: ['ready_for_pickup'],
      ready_for_pickup: ['arrived_at_pickup'],
      arrived_at_pickup: ['loaded'],
      loaded: ['in_transit'],
      in_transit: ['arrived_at_hub', 'arrived_at_destination'],
      arrived_at_hub: ['departed_from_hub'],
      departed_from_hub: ['arrived_at_destination'],
      arrived_at_destination: ['unloading'],
      unloading: ['delivered'],
      delivered: ['pod_received'],
      pod_received: ['completed'],
      completed: ['billed'],
      billed: ['closed'],
    };
    return statusFlow[currentStatus] || [];
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading request details...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Request not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/track-requests')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{request.reference}</h1>
            <p className="text-muted-foreground">
              {type === 'warehouse' ? 'Warehouse Service' : 'Transportation Service'} Request Details
            </p>
          </div>
        </div>

        {type === 'transportation' && (
          <Card>
            <CardContent className="pt-6">
              <TransportStatusTimeline
                currentStatus={request.status}
                onStatusClick={userRole === 'ops' ? handleStatusClick : undefined}
                isOpsUser={userRole === 'ops'}
              />
            </CardContent>
          </Card>
        )}

        {type === 'warehouse' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Current Status:</span>
                  <Badge variant="outline" className={getStatusColor(request.status)}>
                    {formatStatusLabel(request.status)}
                  </Badge>
                </div>
                {userRole === 'ops' && getNextStatuses(request.status).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Update to:</span>
                    {getNextStatuses(request.status).map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusClick(nextStatus)}
                      >
                        {formatStatusLabel(nextStatus)}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {type === 'warehouse' ? (
                  <Package className="h-5 w-5 text-primary" />
                ) : (
                  <TruckIcon className="h-5 w-5 text-accent" />
                )}
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">{request.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{request.status}</p>
                </div>
                {type === 'warehouse' ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">From Date</p>
                      <p className="font-medium">{request.from_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">To Date</p>
                      <p className="font-medium">{request.to_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Area Required</p>
                      <p className="font-medium">{request.area_required} sq m</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dimensions</p>
                      <p className="font-medium">{request.dimensions}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Transport Mode</p>
                      <p className="font-medium">{request.mode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transport Date</p>
                      <p className="font-medium">{request.transport_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vehicle Mode</p>
                      <p className="font-medium capitalize">{request.vehicle_mode || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Insurance Coverage</p>
                      <p className="font-medium flex items-center gap-2">
                        {request.insurance_coverage ? (
                          <><ShieldCheck className="h-4 w-4 text-green-600" /> Yes</>
                        ) : (
                          'No'
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userRole && request.profiles && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{request.profiles.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{request.profiles.email}</p>
                  </div>
                </>
              )}
              {request.companies && (
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-medium">{request.companies.name}</p>
                </div>
              )}
              {request.price && (
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-primary">${request.price}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {type === 'transportation' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pickup Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address:</p>
                    <p>{request.source_street1}</p>
                    {request.source_street2 && <p>{request.source_street2}</p>}
                    <p>{request.source_city}, {request.source_state} {request.source_zip}</p>
                    <p>{request.source_country}</p>
                  </div>
                  {(request.pickup_contact_name || request.pickup_contact_mobile || request.pickup_contact_email) && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Contact:</p>
                      {request.pickup_contact_name && <p className="text-sm">{request.pickup_contact_name}</p>}
                      {request.pickup_contact_mobile && <p className="text-sm">{request.pickup_contact_mobile}</p>}
                      {request.pickup_contact_email && <p className="text-sm">{request.pickup_contact_email}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Destination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address:</p>
                    <p>{request.destination_street1}</p>
                    {request.destination_street2 && <p>{request.destination_street2}</p>}
                    <p>{request.destination_city}, {request.destination_state} {request.destination_zip}</p>
                    <p>{request.destination_country}</p>
                  </div>
                  {(request.receiver_contact_name || request.receiver_contact_mobile || request.receiver_contact_email) && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Receiver Contact:</p>
                      {request.receiver_contact_name && <p className="text-sm">{request.receiver_contact_name}</p>}
                      {request.receiver_contact_mobile && <p className="text-sm">{request.receiver_contact_mobile}</p>}
                      {request.receiver_contact_email && <p className="text-sm">{request.receiver_contact_email}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {type === 'transportation' && request.remarks && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Remarks / Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>UOM</TableHead>
                  {type === 'transportation' && (
                    <>
                      <TableHead>Weight (Kg)</TableHead>
                      <TableHead>Dimension</TableHead>
                    </>
                  )}
                  <TableHead>Fragile</TableHead>
                  <TableHead>Hazardous</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{item.item_code || '-'}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.item_description || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.uom}</TableCell>
                    {type === 'transportation' && (
                      <>
                        <TableCell>{item.weight || '-'}</TableCell>
                        <TableCell>{item.dimension || '-'}</TableCell>
                      </>
                    )}
                    <TableCell>
                      {item.fragile ? (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                          Yes
                        </Badge>
                      ) : (
                        'No'
                      )}
                    </TableCell>
                    <TableCell>
                      {item.hazardous ? (
                        <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-500/20">
                          Yes
                        </Badge>
                      ) : (
                        'No'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Update Status: {formatStatusLabel(selectedStatus)}</DialogTitle>
              <DialogDescription>
                {selectedStatus === 'assigned' && 'Enter driver and vehicle details'}
                {selectedStatus === 'loaded' && 'Upload delivery challan'}
                {selectedStatus === 'pod_received' && 'Upload proof of delivery'}
                {selectedStatus === 'in_transit' && 'Enter tracking information'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedStatus === 'assigned' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="vendor_name">Vendor Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="vendor_name"
                      value={statusData.vendor_name}
                      onChange={(e) => setStatusData({ ...statusData, vendor_name: e.target.value })}
                      placeholder="Enter vendor/carrier name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Vehicle Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={statusData.vehicle_type}
                      onValueChange={(value) => setStatusData({ ...statusData, vehicle_type: value })}
                    >
                      <SelectTrigger id="vehicle_type">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small Van">Small Van</SelectItem>
                        <SelectItem value="Large Van">Large Van</SelectItem>
                        <SelectItem value="Light Truck">Light Truck (LCV)</SelectItem>
                        <SelectItem value="Medium Truck">Medium Truck</SelectItem>
                        <SelectItem value="Heavy Truck">Heavy Truck</SelectItem>
                        <SelectItem value="Flatbed">Flatbed Truck</SelectItem>
                        <SelectItem value="Refrigerated">Refrigerated Truck</SelectItem>
                        <SelectItem value="Tanker">Tanker Truck</SelectItem>
                        <SelectItem value="Container">Container Truck</SelectItem>
                        <SelectItem value="Trailer">Trailer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    <div className="space-y-2">
                        <Label htmlFor="vehicle_number">Vehicle Number</Label>
                        <Input
                            id="vehicle_number"
                            value={statusData.vehicle_number}
                            onChange={(e) => setStatusData({ ...statusData, vehicle_number: e.target.value })}
                            placeholder="Enter vehicle number"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="vehicle_model">Vehicle Model</Label>
                        <Input
                            id="vehicle_model"
                            value={statusData.vehicle_model}
                            onChange={(e) => setStatusData({ ...statusData, vehicle_model: e.target.value })}
                            placeholder="Enter vehicle model"
                        />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Driver Name</Label>
                    <Input
                      id="driver_name"
                      value={statusData.driver_name}
                      onChange={(e) => setStatusData({ ...statusData, driver_name: e.target.value })}
                      placeholder="Enter driver name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="driver_mobile">Driver Mobile</Label>
                    <Input
                      id="driver_mobile"
                      value={statusData.driver_mobile}
                      onChange={(e) => setStatusData({ ...statusData, driver_mobile: e.target.value })}
                      placeholder="Enter driver mobile number"
                    />
                  </div>

                </>
              )}

              {selectedStatus === 'loaded' && (
                <div className="space-y-2">
                  <Label htmlFor="loading_proof">Loading Proof Image</Label>
                  <Input
                    id="loading_proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'loading_proof')}
                  />
                  {statusData.loading_proof && (
                    <img src={statusData.loading_proof} alt="Loading proof preview" className="mt-2 max-h-48 rounded-lg" />
                  )}
                </div>
              )}

              {selectedStatus === 'pod_received' && (
                <div className="space-y-2">
                  <Label htmlFor="pod_proof">POD Proof Image</Label>
                  <Input
                    id="pod_proof"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'pod_proof')}
                  />
                  {statusData.pod_proof && (
                    <img src={statusData.pod_proof} alt="POD proof preview" className="mt-2 max-h-48 rounded-lg" />
                  )}
                </div>
              )}

              {selectedStatus === 'in_transit' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tracking_ref">Tracking Reference</Label>
                    <Input
                      id="tracking_ref"
                      value={statusData.tracking_ref}
                      onChange={(e) => setStatusData({ ...statusData, tracking_ref: e.target.value })}
                      placeholder="Enter tracking reference"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tracking_link">Tracking Link</Label>
                    <Input
                      id="tracking_link"
                      value={statusData.tracking_link}
                      onChange={(e) => setStatusData({ ...statusData, tracking_link: e.target.value })}
                      placeholder="Enter tracking link URL"
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusDialogSubmit}>
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {userRole === 'ops' && type === 'warehouse' && request.status === 'pending' && (
          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={() => updateStatus('approved')}
            >
              Approve Request
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => updateStatus('rejected')}
            >
              Reject Request
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
