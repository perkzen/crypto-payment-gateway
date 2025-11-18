import { AppSidebar } from '@/components/sidebar/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@workspace/ui/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
