'use client';

import Image from 'next/image';
import {
  LayoutDashboard,
  Radio,
  Users,
  AlertTriangle,
  Shield,
  FileText,
  Siren,
  MapPin,
  LogOut,
  ClipboardList,
  Map,
  CalendarClock,
  Bell,
  History,
  Truck,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageKey, Role } from '@/lib/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  page: PageKey;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { title: 'Operations', page: 'admin-dashboard', icon: LayoutDashboard },
  { title: 'User Management', page: 'admin-users', icon: Users },
  { title: 'Reports', page: 'admin-reports-page', icon: ClipboardList },
  { title: 'Response Teams', page: 'admin-response-teams', icon: Siren },
  { title: 'Audit Logs', page: 'admin-audit-logs', icon: FileText },
  { title: 'Incident Types', page: 'admin-incident-types', icon: MapPin },
];

const dispatcherNavItems: NavItem[] = [
  { title: 'Operations', page: 'dispatcher-dashboard', icon: Radio },
  { title: 'Map', page: 'dispatcher-map', icon: Map },
  { title: 'Reports', page: 'dispatcher-reports', icon: AlertTriangle },
  { title: 'Responders', page: 'dispatcher-responders', icon: Shield },
  { title: 'Schedule', page: 'dispatcher-schedule', icon: CalendarClock },
];

const driverResponderNavItems: NavItem[] = [
  { title: 'My Assignments', page: 'driver-dashboard', icon: LayoutDashboard },
  { title: 'Reports', page: 'driver-reports', icon: AlertTriangle },
  { title: 'Vehicle Tracking', page: 'driver-vehicle-tracking', icon: Truck },
];

const residentNavItems: NavItem[] = [
  { title: 'Home', page: 'resident-dashboard', icon: LayoutDashboard },
  { title: 'Report', page: 'resident-report', icon: AlertTriangle },
  { title: 'Schedule', page: 'resident-schedule', icon: CalendarClock },
  { title: 'History', page: 'resident-history', icon: History },
  { title: 'Notifications', page: 'resident-notifications', icon: Bell },
];

const navMap: Record<string, NavItem[]> = {
  admin: adminNavItems,
  dispatcher: dispatcherNavItems,
  'driver/responder': driverResponderNavItems,
  resident: residentNavItems,
};

export function AppSidebar() {
  const { currentUser, currentPage, navigateTo, logout, isGuest } = useAppStore();

  const role = currentUser?.role || 'admin';
  const navItems = navMap[role] || [];

  // Resident sidebar has different styling
  const isResident = role === 'resident';

  return (
    <Sidebar className={`border-r ${isResident ? 'border-emerald-100 dark:border-gray-800' : 'border-blue-100 dark:border-gray-800'}`}>
      {/* Header with branding */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/mdrrmo-logo.png"
            alt="MDRRMO Logo"
            width={40}
            height={40}
            className="shrink-0"
            priority
          />
          <div className="min-w-0">
            <h2 className={`text-base font-bold bg-gradient-to-r ${isResident ? 'from-emerald-600 to-teal-600' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
              MDRRMO
            </h2>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              Disaster Risk Reduction
            </p>
          </div>
        </div>
      </SidebarHeader>

      <Separator className={isResident ? 'bg-emerald-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-gray-800'} />

      {/* Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-[11px] font-semibold uppercase tracking-wider ${isResident ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-blue-600/70 dark:text-blue-400/70'}`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;

                return (
                  <SidebarMenuItem key={item.page}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigateTo(item.page)}
                      tooltip={item.title}
                      className={`group relative transition-all duration-200 ${
                        isActive
                          ? isResident
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : 'hover:bg-blue-50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive
                          ? isResident
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-blue-600 dark:text-blue-400'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`} />
                      <span>{item.title}</span>
                      {isActive && (
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full ${isResident ? 'bg-gradient-to-b from-emerald-500 to-teal-500' : 'bg-gradient-to-b from-blue-500 to-indigo-500'}`} />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator className={isResident ? 'bg-emerald-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-gray-800'} />

      {/* Footer with only logout button */}
      <SidebarFooter className="p-3">
        <button
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isResident
              ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
              : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
