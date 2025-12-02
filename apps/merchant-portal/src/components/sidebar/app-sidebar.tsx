'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@workspace/ui/components/sidebar';
import { CreditCard, LayoutDashboard, Settings2 } from 'lucide-react';
import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import { SidebarHeaderComponent } from '@/components/sidebar/sidebar-header';

const navItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Payments',
    url: '/dashboard/payments',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings2,
    items: [
      {
        title: 'General',
        url: '/dashboard/settings',
      },
      {
        title: 'API Keys',
        url: '/dashboard/settings/api-keys',
      },
      {
        title: 'Webhooks',
        url: '/dashboard/settings/webhooks',
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeaderComponent />
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
