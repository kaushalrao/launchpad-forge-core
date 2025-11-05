import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Package, TruckIcon, Shield, Clock, Users, BoxIcon, Navigation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-primary p-2">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">4PL</span>
          </div>
          <Button onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-hero bg-clip-text text-transparent">
              Your Trusted Fourth-Party Logistics Partner
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your supply chain with our comprehensive 4PL platform. 
              Connect with anonymous service providers for warehouse and transportation solutions.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                  Get Started
              </Button>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground">
              Comprehensive logistics solutions for your business
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="group p-8 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary transition-all">
              <div className="mb-4 w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Package className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Warehouse as a Service</h3>
              <p className="text-muted-foreground">
                Flexible storage solutions with real-time inventory management 
                and seamless provider matching.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 hover:border-accent transition-all">
              <div className="mb-4 w-16 h-16 rounded-lg bg-gradient-accent flex items-center justify-center">
                <TruckIcon className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Transportation as a Service</h3>
              <p className="text-muted-foreground">
                Multi-modal transportation solutions with end-to-end tracking 
                and optimized route planning.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 hover:border-blue-500 transition-all">
              <div className="mb-4 w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <BoxIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Inventory as a Service</h3>
              <p className="text-muted-foreground">
                Manage and track your inventory with real-time monitoring
                and automated stock management.
              </p>
            </div>

            <div className="group p-8 rounded-xl bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-2 border-teal-500/20 hover:border-teal-500 transition-all">
              <div className="mb-4 w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Navigation className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Logistics as a Service</h3>
              <p className="text-muted-foreground">
                End-to-end logistics solutions for your supply chain
                with comprehensive tracking and optimization.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-6 py-20 bg-card/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose UPL?</h2>
            <p className="text-muted-foreground">
              Built for efficiency, security, and scalability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Complete Anonymity</h3>
              <p className="text-sm text-muted-foreground">
                Your data and provider information remain confidential through our neutral platform
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg">Real-Time Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your requests and shipments with live updates and notifications
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-lg">Trusted Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect with verified service providers through our curated network
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-gradient-hero">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Logistics?
            </h2>
            <p className="text-white/90 text-lg">
              Join leading businesses using UPL for their supply chain needs
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/auth')}>
              Get Started Today
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 UPL 4PL Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
