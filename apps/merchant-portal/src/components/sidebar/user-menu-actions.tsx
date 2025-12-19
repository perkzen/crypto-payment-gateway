'use client';

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu';
import { useSidebar } from '@workspace/ui/components/sidebar';
import { Copy, ExternalLink, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConnection } from 'wagmi';
import { UserInfo } from './user-info';
import { signOut } from '@/lib/auth-client';
import { copyToClipboard, getBlockExplorerUrl } from '@/lib/utils';

export function UserMenuActions() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { chain, address } = useConnection();

  if (!address || !chain) return null;

  const handleSignOut = async () => {
    signOut();
    router.push('/sign-in');
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
