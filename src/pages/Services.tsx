import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, TruckIcon, ArrowRight, BoxIcon, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Services() {
  const navigate = useNavigate();

  useEffect(() => {
        document.title = 'Service Request';
  }, []);
    const bgVariants: Record<string, string> = {
        blue: 'from-blue-50 to-blue-100',
        green: 'from-green-50 to-green-100',
        teal: 'from-teal-50 to-teal-100',
    };
    const services = [
        {
            title: 'Warehouse as a Service',
            description: 'Request storage space and warehousing solutions for your inventory.',
            path: '/services/warehouse',
            icon: Package,
            iconBg: 'bg-blue-600',
            color: 'blue',
        },
        {
            title: 'Transportation as a Service',
            description: 'Book logistics and transportation services for your shipments.',
            path: '/services/transportation',
            icon: TruckIcon,
            iconBg: 'bg-green-600',
            color: 'green',
        },
        {
            title: 'Inventory as a Service',
            description: 'Manage and track your inventory with real-time monitoring.',
            path: '/services/inventory',
            icon: BoxIcon,
            iconBg: 'bg-blue-600',
            color: 'blue',
        },
        {
            title: 'Logistics as a Service',
            description: 'End-to-end logistics solutions for your supply chain.',
            path: '/services/logistics',
            icon: Navigation,
            iconBg: 'bg-teal-600',
            color: 'teal',
        },
    ];




    return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-muted-foreground">
            Choose a service to create a new request
          </p>
        </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                  const Icon = service.icon;
                  return (
                      <Card
                          key={service.path}
                          onClick={() => navigate(service.path)}
                          className={`group relative cursor-pointer transition-all rounded-2xl border 
                                    bg-gradient-to-br ${bgVariants[service.color] || 'from-gray-50 to-gray-100'} 
                                    hover:shadow-md hover:scale-[1.02] hover:border-primary/30 p-6 text-center`}
                      >
                          <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl  ${service.iconBg} transition-all`}>
                              <service.icon className="h-7 w-7 text-white" />
                          </div>

                          <CardHeader className="p-0 space-y-2">
                              <CardTitle className="text-lg font-semibold text-foreground">
                                  {service.title}
                              </CardTitle>
                              <CardDescription className="text-base text-muted-foreground">
                                  {service.description}
                              </CardDescription>
                          </CardHeader>
                      </Card>

                  );
              })}
          </div>

      </div>
    </DashboardLayout>
  );
}
