'use client';

import { ChevronsUpDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { signOut } from '@/lib/auth';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
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

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();

  if (!isConnected || !address) {
    return null;
  }

  const handleSignOut = async () => {
    signOut();
    router.push('/');
  };

  const copyAddress = () => {
    void navigator.clipboard.writeText(address);
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
          {({ account, chain: accountChain }) => {
            if (!account) return null;

            const displayName = 'Domen Perko';
            const chainName = accountChain?.name || chain?.name || 'Unknown';

            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {displayName}
                      </span>
                      <span className="truncate text-xs">{chainName}</span>
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
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {displayName}
                        </span>
                        <span className="truncate font-mono text-xs">
                          {account.address}
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
                      onClick={() =>
                        window.open(getBlockExplorerUrl(), '_blank')
                      }
                    >
                      <ExternalLink className="size-4" />
                      View on Block Explorer
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }}
        </ConnectButton.Custom>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
