'use client';

import { Copy, ExternalLink, LogOut } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu';
import { copyToClipboard, getBlockExplorerUrl } from '@/lib/utils';
import { UserInfo } from './user-info';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@workspace/ui/components/sidebar';
import { useAccount } from 'wagmi';

export function UserMenuActions() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { chain, address } = useAccount();

  if (!address || !chain) return null;

  const handleSignOut = async () => {
    signOut();
    router.push('/');
  };

  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={isMobile ? 'bottom' : 'right'}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <UserInfo className="px-1 py-1.5" />
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => copyToClipboard(address)}>
          <Copy className="size-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            window.open(getBlockExplorerUrl({ chain, address }), '_blank');
          }}
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
  );
}
