import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { cn } from '@workspace/ui/lib/utils';
import { useConnection } from 'wagmi';
import { formatAddress } from '@/lib/utils';

type UserInfoProps = {
  className?: string;
};

export function UserInfo({ className }: UserInfoProps) {
  const { address } = useConnection();

  return (
    <div className={cn('flex items-center gap-2 text-left text-sm', className)}>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">Anonymous</span>
        <span className="font-mono text-xs">
          {formatAddress(
            address ?? '0x0000000000000000000000000000000000000000',
          )}
        </span>
      </div>
    </div>
  );
}
