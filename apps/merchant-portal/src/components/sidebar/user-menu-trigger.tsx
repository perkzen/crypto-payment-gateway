import { DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu';
import { SidebarMenuButton } from '@workspace/ui/components/sidebar';
import { ChevronsUpDown } from 'lucide-react';
import { UserInfo } from './user-info';

export function UserMenuTrigger() {
  return (
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <UserInfo />
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  );
}
