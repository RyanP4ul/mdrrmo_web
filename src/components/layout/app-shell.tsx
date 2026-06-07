'use client';

import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/auth/login-page';
import { RegisterPage } from '@/components/auth/register-page';
import { AdminDashboard } from '@/components/admin/dashboard';
import { UserManagement } from '@/components/admin/user-management';
import { AdminReports } from '@/components/admin/reports';
import { ResponseTeams } from '@/components/admin/response-teams';
import { AuditLogs } from '@/components/admin/audit-logs';
import { IncidentTypes } from '@/components/admin/incident-types';
import { VehicleTracking } from '@/components/shared/vehicle-tracking';
import { DispatcherDashboard } from '@/components/dispatcher/dashboard';
import { DispatcherMap } from '@/components/dispatcher/dispatcher-map';
import { DispatcherSchedule } from '@/components/dispatcher/schedule';
import { DispatcherReports } from '@/components/dispatcher/reports';
import { Responders as DispatcherResponders } from '@/components/dispatcher/responders';
import { ReportDetail as DispatcherReportDetail } from '@/components/dispatcher/report-detail';
import { DriverDashboard } from '@/components/driver/dashboard';
import { DriverReports } from '@/components/driver/reports';
import { ResidentDashboard } from '@/components/resident/dashboard';
import { ResidentReport } from '@/components/resident/report';
import { ResidentSchedule } from '@/components/resident/schedule';
import { ResidentHistory } from '@/components/resident/history';
import { ResidentNotifications } from '@/components/resident/notifications';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import type { PageKey } from '@/lib/types';

// Pages that don't need the sidebar/header layout
const AUTH_PAGES: PageKey[] = ['login', 'register', 'resident-login', 'resident-register'];

function PageContent({ page }: { page: PageKey }) {
  switch (page) {
    // Auth pages
    case 'login':
    case 'resident-login':
      return <LoginPage />;
    case 'register':
    case 'resident-register':
      return <RegisterPage />;

    // Admin pages
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-users':
      return <UserManagement />;
    case 'admin-reports-page':
      return <AdminReports />;
    case 'admin-response-teams':
      return <ResponseTeams />;
    case 'admin-audit-logs':
      return <AuditLogs />;
    case 'admin-incident-types':
      return <IncidentTypes />;
    case 'driver-vehicle-tracking':
      return <VehicleTracking />;

    // Dispatcher pages
    case 'dispatcher-dashboard':
      return <DispatcherDashboard />;
    case 'dispatcher-reports':
      return <DispatcherReports />;
    case 'dispatcher-report-detail':
      return <DispatcherReportDetail />;
    case 'dispatcher-responders':
      return <DispatcherResponders />;
    case 'dispatcher-map':
      return <DispatcherMap />;
    case 'dispatcher-schedule':
      return <DispatcherSchedule />;

    // Driver pages
    case 'driver-dashboard':
    case 'driver-assignments':
      return <DriverDashboard />;
    case 'driver-reports':
      return <DriverReports />;

    // Resident pages
    case 'resident-dashboard':
      return <ResidentDashboard />;
    case 'resident-report':
      return <ResidentReport />;
    case 'resident-schedule':
      return <ResidentSchedule />;
    case 'resident-history':
      return <ResidentHistory />;
    case 'resident-notifications':
      return <ResidentNotifications />;

    default:
      return <LoginPage />;
  }
}

export function AppShell() {
  const { currentPage, isAuthenticated } = useAppStore();

  // If not authenticated or on auth pages, show auth layout (no sidebar)
  if (!isAuthenticated || AUTH_PAGES.includes(currentPage)) {
    return <PageContent page={currentPage} />;
  }

  // Authenticated layout with sidebar and header
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <PageContent page={currentPage} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
