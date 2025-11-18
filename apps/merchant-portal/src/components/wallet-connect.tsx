"use client"

import * as React from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"
import { Wallet } from "lucide-react"

export function WalletConnect() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== "loading"
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated")

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <SidebarMenuButton
                        onClick={openConnectModal}
                        size="lg"
                        className="w-full"
                      >
                        <Wallet className="size-4" />
                        <span>Connect Wallet</span>
                      </SidebarMenuButton>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <SidebarMenuButton
                        onClick={openChainModal}
                        size="lg"
                        className="w-full"
                      >
                        <Wallet className="size-4" />
                        <span>Wrong Network</span>
                      </SidebarMenuButton>
                    )
                  }

                  return (
                    <SidebarMenuButton
                      onClick={openAccountModal}
                      size="lg"
                      className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <Wallet className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {account.displayName}
                        </span>
                        <span className="truncate text-xs">
                          {chain.name}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

