'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { DropdownMenu } from '@workspace/ui/components/dropdown-menu';
import { SidebarMenu, SidebarMenuItem } from '@workspace/ui/components/sidebar';
import { UserMenuActions } from './user-menu-actions';
import { UserMenuTrigger } from './user-menu-trigger';

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ConnectButton.Custom>
          {() => {
            return (
              <DropdownMenu>
                <UserMenuTrigger />
                <UserMenuActions />
              </DropdownMenu>
            );
          }}
        </ConnectButton.Custom>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
