import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';

export default function LogisticsRequest() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistics Request</h1>
          <p className="text-muted-foreground">
            End-to-end logistics solutions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Logistics as a Service</CardTitle>
            <CardDescription>
              This service is coming soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Navigation className="h-24 w-24 text-muted-foreground" />
              <p className="text-center text-muted-foreground max-w-md">
                End-to-end logistics solutions will be available soon. You'll be able to manage 
                your entire supply chain with comprehensive logistics services.
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
