'use client';

import { useAppStore } from '@/lib/store';
import { PageKey } from '@/lib/types';
import { LoginPage } from '@/components/auth/login-page';
import { RegisterPage } from '@/components/auth/register-page';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AdminDashboard } from '@/components/admin/dashboard';
import { UserManagement } from '@/components/admin/user-management';
import { EmergencyReports } from '@/components/admin/emergency-reports';
import { ResponseTeams } from '@/components/admin/response-teams';
import { Announcements } from '@/components/admin/announcements';
import { AuditLogs } from '@/components/admin/audit-logs';
import { IncidentTypes } from '@/components/admin/incident-types';
import { DispatcherDashboard } from '@/components/dispatcher/dashboard';
import { DispatcherReports } from '@/components/dispatcher/reports';
import { ReportDetail } from '@/components/dispatcher/report-detail';
import { Responders } from '@/components/dispatcher/responders';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

function PageRenderer({ page }: { page: PageKey }) {
  switch (page) {
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-users':
      return <UserManagement />;
    case 'admin-reports':
      return <EmergencyReports />;
    case 'admin-response-teams':
      return <ResponseTeams />;
    case 'admin-announcements':
      return <Announcements />;
    case 'admin-audit-logs':
      return <AuditLogs />;
    case 'admin-incident-types':
      return <IncidentTypes />;
    case 'dispatcher-dashboard':
      return <DispatcherDashboard />;
    case 'dispatcher-reports':
      return <DispatcherReports />;
    case 'dispatcher-report-detail':
      return <ReportDetail />;
    case 'dispatcher-responders':
      return <Responders />;
    default:
      return <LoginPage />;
  }
}

export default function Home() {
  const { currentPage, isAuthenticated } = useAppStore();

  // Auth pages - no sidebar layout
  if (!isAuthenticated || currentPage === 'login' || currentPage === 'register') {
    return <PageRenderer page={currentPage} />;
  }

  // Authenticated pages - sidebar + header layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50/50 dark:bg-gray-950/50">
          <PageRenderer page={currentPage} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
