import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { AppSidebar } from '@/components/sidebar/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
