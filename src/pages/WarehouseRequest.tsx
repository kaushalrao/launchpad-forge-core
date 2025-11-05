import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface Item {
  item_name: string;
  quantity: number;
  uom: string;
}

export default function WarehouseRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    provider_id: '',
    from_date: '',
    to_date: '',
    dimensions: '',
    area_required: '',
  });

  const [items, setItems] = useState<Item[]>([
    { item_name: '', quantity: 0, uom: 'Carton' }
  ]);

  useEffect(() => {
      document.title = 'Warehouse Request';
      fetchProviders();
  }, []);

  const fetchProviders = async () => {
    const { data } = await supabase.from('companies').select('*');
    if (data) setProviders(data);
  };

  const addItem = () => {
    setItems([...items, { item_name: '', quantity: 0, uom: 'Carton' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Generate reference
      const reference = `WH-${Date.now()}`;

      // Insert warehouse request
      const { data: request, error: requestError } = await supabase
        .from('warehouse_requests')
        .insert({
          reference,
          customer_id: user.id,
          provider_id: formData.provider_id || null,
          from_date: formData.from_date,
          to_date: formData.to_date,
          dimensions: formData.dimensions,
          area_required: parseFloat(formData.area_required),
          status: 'pending',
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Insert items
      const itemsData = items.map(item => ({
        warehouse_request_id: request.id,
        item_name: item.item_name,
        quantity: item.quantity,
        uom: item.uom,
      }));

      const { error: itemsError } = await supabase
        .from('warehouse_request_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      // Send confirmation email
      if (user.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase.functions.invoke('send-request-email', {
            body: {
              to: profile.email,
              customerName: profile.name,
              reference,
              type: 'submission',
              serviceType: 'warehouse',
            },
          });
        }
      }

      toast.success('Warehouse request created successfully!');
      navigate('/track-requests');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          {/*<h1 className="text-3xl font-bold tracking-tight">Warehouse Request</h1>*/}
          {/*<p className="text-muted-foreground">*/}
          {/*  Request warehouse storage space*/}
          {/*</p>*/}
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Fill in the details for your warehouse service request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider (Optional)</Label>
                  <Select
                    value={formData.provider_id}
                    onValueChange={(value) => setFormData({ ...formData, provider_id: value })}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    placeholder="e.g., 10m x 20m x 5m"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_date">From Date</Label>
                  <Input
                    id="from_date"
                    type="date"
                    value={formData.from_date}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to_date">To Date</Label>
                  <Input
                    id="to_date"
                    type="date"
                    value={formData.to_date}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area Required (sq m)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 500"
                    value={formData.area_required}
                    onChange={(e) => setFormData({ ...formData, area_required: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Items</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">#</th>
                          <th className="text-left p-3 text-sm font-medium">Item Name</th>
                          <th className="text-left p-3 text-sm font-medium">Quantity</th>
                          <th className="text-left p-3 text-sm font-medium">UOM</th>
                          <th className="text-center p-3 text-sm font-medium w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                            <td className="p-3">
                              <Input
                                placeholder="Item name"
                                value={item.item_name}
                                onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                                required
                                className="h-9"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={item.quantity || ''}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                required
                                className="h-9"
                              />
                            </td>
                            <td className="p-3">
                              <Select
                                value={item.uom}
                                onValueChange={(value) => updateItem(index, 'uom', value)}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Carton">Carton</SelectItem>
                                  <SelectItem value="Pallet">Pallet</SelectItem>
                                  <SelectItem value="Piece">Piece</SelectItem>
                                  <SelectItem value="Box">Box</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3 text-center">
                              {items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(index)}
                                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/services')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
