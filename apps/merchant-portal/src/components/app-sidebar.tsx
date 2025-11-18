"use client"

import * as React from "react"
import {
  LayoutDashboard,
  CreditCard,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { WalletConnect } from "@/components/wallet-connect"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Payments",
    url: "/dashboard/payments",
    icon: CreditCard,
    items: [
      {
        title: "All Transactions",
        url: "/dashboard/payments",
      },
      {
        title: "Pending",
        url: "/dashboard/payments?status=pending",
      },
      {
        title: "Completed",
        url: "/dashboard/payments?status=completed",
      },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
    items: [
      {
        title: "General",
        url: "/dashboard/settings",
      },
      {
        title: "API Keys",
        url: "/dashboard/settings/api-keys",
      },
      {
        title: "Webhooks",
        url: "/dashboard/settings/webhooks",
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WalletConnect />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
