import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BoxIcon } from 'lucide-react';

export default function InventoryRequest() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Request</h1>
          <p className="text-muted-foreground">
            Manage and track your inventory
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory as a Service</CardTitle>
            <CardDescription>
              This service is coming soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <BoxIcon className="h-24 w-24 text-muted-foreground" />
              <p className="text-center text-muted-foreground max-w-md">
                Inventory management features will be available soon. You'll be able to track, 
                monitor, and manage your inventory with real-time updates.
              </p>
              <Button onClick={() => navigate('/services')}>
                Back to Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
