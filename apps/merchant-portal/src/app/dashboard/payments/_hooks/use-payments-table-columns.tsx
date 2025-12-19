import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '@workspace/ui/components/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Payment } from '@workspace/shared';

const columnHelper = createColumnHelper<Payment>();

function getStatusBadge(status: Payment['status']) {
  switch (status) {
    case 'confirmed':
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Confirmed
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="default" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function usePaymentsTableColumns() {
  return useMemo(
    () => [
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => getStatusBadge(info.getValue()),
      }),
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-sm">
            {info.getValue().slice(0, 8)}...
          </span>
        ),
      }),
      columnHelper.accessor('paidAmount', {
        header: 'Amount',
        cell: (info) => {
          const payment = info.row.original;
          return (
            <div className="font-semibold">
              {payment.paidAmount} {payment.network}
              {payment.tokenAddress && (
                <span className="text-muted-foreground ml-1 text-xs">
                  (Token)
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('network', {
        header: 'Network',
        cell: (info) => (
          <span className="text-sm capitalize">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('txHash', {
        header: 'Transaction',
        cell: (info) => {
          const txHash = info.getValue();
          const network = info.row.original.network;
          // Simple block explorer URL - can be enhanced based on network
          const explorerUrl =
            network === 'ethereum' || network === 'hardhat'
              ? `https://etherscan.io/tx/${txHash}`
              : `#`;

          return (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-mono text-sm hover:underline"
            >
              {txHash.slice(0, 10)}...
            </a>
          );
        },
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: (info) => (
          <span className="text-muted-foreground text-sm">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
    ],
    [],
  );
}
