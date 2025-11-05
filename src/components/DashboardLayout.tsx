import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Truck, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userRole, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Top Bar */}
            <header className="sticky top-0 z-40 border-b bg-card shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/95">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger />
                        {/* Page Title will appear here */}
                        <span className="text-xl font-semibold tracking-tight">
        {document.title || 'Dashboard'}
      </span>
                    </div>

                    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {userRole === 'ops' ? 'Operations Manager' : 'Customer'}
      </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                                <DropdownMenuLabel>Profile</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {profile && (
                                    <div className="px-2 py-3 space-y-2 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name: </span>
                                            <span className="font-medium">{profile.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Email: </span>
                                            <span className="font-medium">{profile.email}</span>
                                        </div>
                                        {profile.mobile_number && (
                                            <div>
                                                <span className="text-muted-foreground">Mobile: </span>
                                                <span className="font-medium">{profile.mobile_number}</span>
                                            </div>
                                        )}
                                        {profile.address && (
                                            <div>
                                                <span className="text-muted-foreground">Address: </span>
                                                <span className="font-medium">{profile.address}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={signOut} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>


            {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
