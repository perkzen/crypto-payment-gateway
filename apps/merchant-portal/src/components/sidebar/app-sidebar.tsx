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
import { ROUTE_PATHS } from '@/lib/routes';

const navItems = [
  {
    title: 'Dashboard',
    url: ROUTE_PATHS.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Payments',
    url: ROUTE_PATHS.PAYMENTS,
    icon: CreditCard,
  },
  {
    title: 'Settings',
    url: ROUTE_PATHS.SETTINGS,
    icon: Settings2,
    items: [
      {
        title: 'General',
        url: ROUTE_PATHS.SETTINGS,
      },
      {
        title: 'API Keys',
        url: ROUTE_PATHS.API_KEYS,
      },
      {
        title: 'Webhooks',
        url: ROUTE_PATHS.WEBHOOKS,
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
