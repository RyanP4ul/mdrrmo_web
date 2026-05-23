'use client';

import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Shield,
  Megaphone,
  FileText,
  Siren,
  MapPin,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageKey, Role } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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

interface NavItem {
  title: string;
  page: PageKey;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', page: 'admin-dashboard', icon: LayoutDashboard },
  { title: 'User Management', page: 'admin-users', icon: Users },
  { title: 'Emergency Reports', page: 'admin-reports', icon: AlertTriangle },
  { title: 'Response Teams', page: 'admin-response-teams', icon: Siren },
  { title: 'Announcements', page: 'admin-announcements', icon: Megaphone },
  { title: 'Audit Logs', page: 'admin-audit-logs', icon: FileText },
  { title: 'Incident Types', page: 'admin-incident-types', icon: MapPin },
];

const dispatcherNavItems: NavItem[] = [
  { title: 'Dashboard', page: 'dispatcher-dashboard', icon: LayoutDashboard },
  { title: 'Reports', page: 'dispatcher-reports', icon: AlertTriangle },
  { title: 'Responders', page: 'dispatcher-responders', icon: Shield },
];

const navMap: Record<Role, NavItem[]> = {
  admin: adminNavItems,
  dispatcher: dispatcherNavItems,
  resident: [],
};

export function AppSidebar() {
  const { currentUser, currentPage, navigateTo, logout } = useAppStore();

  const role = currentUser?.role || 'admin';
  const navItems = navMap[role] || [];

  const initials = currentUser
    ? `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`
    : 'U';

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <Sidebar className="border-r border-blue-100 dark:border-gray-800">
      {/* Header with branding */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/mmodrm-logo.png"
            alt="MMODRM Logo"
            width={40}
            height={40}
            className="shrink-0"
            priority
          />
          <div className="min-w-0">
            <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MMODRM
            </h2>
            <p className="text-[10px] text-muted-foreground leading-tight truncate">
              Disaster Risk Reduction
            </p>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="bg-blue-100 dark:bg-gray-800" />

      {/* Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-600/70 dark:text-blue-400/70 text-[11px] font-semibold uppercase tracking-wider">
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
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30'
                          : 'hover:bg-blue-50 dark:hover:bg-gray-800/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`} />
                      <span>{item.title}</span>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Separator className="bg-blue-100 dark:bg-gray-800" />

      {/* Footer with user info */}
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50 dark:bg-gray-800/50">
          <Avatar className="w-9 h-9 border-2 border-blue-200 dark:border-blue-800">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              {roleLabel}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
