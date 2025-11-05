import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import {LayoutDashboard, PackageSearch, FileText, Truck} from 'lucide-react';

export function AppSidebar() {
  const { userRole } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const customerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: PackageSearch, label: 'Service Request', path: '/services' },
    { icon: FileText, label: 'Track Requests', path: '/track-requests' },
  ];

  const opsMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Track Requests', path: '/track-requests' },
  ];

  const menuItems = userRole === 'ops' ? opsMenuItems : customerMenuItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
          <header className="sticky top-0 z-40 border-b bg-card shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/95">
              <div className={`flex h-16 items-center justify-${collapsed ? 'center' : 'between'} px-6 transition-all duration-300`}>
                  <div className="flex items-center gap-3">
                      <div
                          className={`rounded-lg bg-gradient-primary p-${collapsed ? '1' : '2'} transition-all duration-300`}
                      >
                          <Truck className={`text-primary-foreground transition-all duration-300 ${collapsed ? 'h-5 w-5' : 'h-6 w-6'}`} />
                      </div>
                      {!collapsed && (
                          <span className="text-xl font-bold transition-all duration-300">UPL</span>
                      )}
                  </div>
              </div>
          </header>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                    <SidebarMenuItem key={item.path}>
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center transition-all font-medium rounded-lg 
      ${collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
      ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`
                            }
                        >
                            {/* Icon */}
                            <div
                                className={`flex items-center justify-center transition-all duration-300
        ${collapsed ? 'w-10 h-10' : 'w-6 h-6'}
        ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}
      `}
                            >
                                <item.icon className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'}`} />
                            </div>

                            {/* Label */}
                            {!collapsed && (
                                <span
                                    className={`transition-all ${
                                        isActive ? 'text-white font-semibold' : ''
                                    }`}
                                >
        {item.label}
      </span>
                            )}
                        </NavLink>
                    </SidebarMenuItem>


                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
