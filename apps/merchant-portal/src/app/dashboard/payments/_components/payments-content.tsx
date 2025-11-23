'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  Search,
  XCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/page-header';

type PaymentStatus = 'all' | 'pending' | 'completed' | 'failed';

export function PaymentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const status = (searchParams.get('status') as PaymentStatus) || 'all';

  const setStatus = (newStatus: PaymentStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    router.push(`/dashboard/payments?${params.toString()}`);
  };

  // Mock data - replace with actual API calls
  const payments: Array<{
    id: string;
    amount: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
    txHash?: string;
  }> = [];

  const filteredPayments = payments.filter((payment) => {
    if (status !== 'all' && payment.status !== status) return false;
    if (
      searchQuery &&
      !payment.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium';
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-500/10 text-green-500`;
      case 'pending':
        return `${baseClasses} bg-yellow-500/10 text-yellow-500`;
      case 'failed':
        return `${baseClasses} bg-red-500/10 text-red-500`;
      default:
        return `${baseClasses} bg-muted text-muted-foreground`;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="PaymentsService"
        description="View and manage all your payment transactions"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={status === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatus('all')}
            >
              All
            </Button>
            <Button
              variant={status === 'pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatus('pending')}
            >
              Pending
            </Button>
            <Button
              variant={status === 'completed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setStatus('completed')}
            >
              Completed
            </Button>
          </div>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="bg-card flex flex-1 flex-col items-center justify-center rounded-lg border py-12">
          <CreditCard className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No payments found</h3>
          <p className="text-muted-foreground mb-4 text-center text-sm">
            {searchQuery || status !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Your payment transactions will appear here'}
          </p>
          {(searchQuery || status !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatus('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    ID
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Amount
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Transaction
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-sm">
                      {payment.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {payment.amount} {payment.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={getStatusBadge(payment.status)}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {payment.txHash ? (
                        <a
                          href={`https://etherscan.io/tx/${payment.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-mono text-sm hover:underline"
                        >
                          {payment.txHash.slice(0, 10)}...
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
