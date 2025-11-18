'use client';

import {
  ChevronsUpDown,
  Copy,
  ExternalLink,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession, signOut } from '@/lib/auth';

import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar';

const displayName = 'User';
const initials = 'U';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: session } = useSession();

  if (!isConnected || !address) {
    return null;
  }

  const handleSignOut = async () => {
    if (session) {
      await signOut();
    }
    disconnect();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const getBlockExplorerUrl = () => {
    if (chain?.blockExplorers?.default) {
      return `${chain.blockExplorers.default.url}/address/${address}`;
    }
    // Fallback to etherscan if chain not found or no block explorer
    return `https://etherscan.io/address/${address}`;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ConnectButton.Custom>
          {({ openAccountModal }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{displayName}</span>
                    <span className="truncate text-xs">
                      {session?.user ? 'Authenticated' : 'Connected'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {displayName}
                      </span>
                      <span className="truncate font-mono text-xs">
                        {address}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={copyAddress}>
                    <Copy className="size-4" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open(getBlockExplorerUrl(), '_blank')}
                  >
                    <ExternalLink className="size-4" />
                    View on Block Explorer
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={openAccountModal}>
                    <Settings className="size-4" />
                    Wallet Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </ConnectButton.Custom>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
