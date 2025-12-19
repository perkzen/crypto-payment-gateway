'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { CreditCard, Filter, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listPaymentsOptions } from '../_hooks/queries';
import { usePaymentsTableColumns } from '../_hooks/use-payments-table-columns';
import { PaymentsPagination } from './payments-pagination';
import type { Payment } from '@workspace/shared';
import { PageHeader } from '@/components/page-header';

type PaymentStatus = 'all' | 'pending' | 'confirmed' | 'failed';

export function PaymentsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Get query params with defaults
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const statusParam = searchParams.get('status') as PaymentStatus | null;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  // Map UI status to API status (UI shows 'all', API doesn't need it)
  const apiStatus: 'pending' | 'confirmed' | 'failed' | undefined =
    statusParam && statusParam !== 'all' ? statusParam : undefined;

  // Build query object
  const query = useMemo(
    () => ({
      page,
      limit,
      status: apiStatus,
      sortOrder,
    }),
    [page, limit, apiStatus, sortOrder],
  );

  // Fetch payments
  const { data, isLoading, error } = useQuery(listPaymentsOptions(query));

  const payments = useMemo(() => data?.data || [], [data]);
  const meta = data?.meta;

  // Client-side search filter
  const filteredPayments = useMemo(() => {
    if (!searchQuery) return payments;

    const query = searchQuery.toLowerCase();
    return payments.filter(
      (payment: Payment) =>
        payment.id.toLowerCase().includes(query) ||
        payment.txHash.toLowerCase().includes(query),
    );
  }, [payments, searchQuery]);

  const columns = usePaymentsTableColumns();

  const table = useReactTable({
    data: filteredPayments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleStatusChange = (newStatus: PaymentStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page'); // Reset to page 1 when filtering
    if (newStatus === 'all') {
      params.delete('status');
    } else {
      params.set('status', newStatus);
    }
    router.push(`/dashboard/payments?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/dashboard/payments?${params.toString()}`);
  };

  const currentStatus: PaymentStatus = statusParam || 'all';

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PageHeader
          title="Payments"
          description="View and manage all your payment transactions"
        />
        <div className="bg-card flex flex-1 flex-col items-center justify-center rounded-lg border py-12">
          <CreditCard className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Error loading payments</h3>
          <p className="text-muted-foreground mb-4 text-center text-sm">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Payments"
        description="View and manage all your payment transactions"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by ID or transaction hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              variant={currentStatus === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusChange('all')}
            >
              All
            </Button>
            <Button
              variant={currentStatus === 'pending' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusChange('pending')}
            >
              Pending
            </Button>
            <Button
              variant={currentStatus === 'confirmed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusChange('confirmed')}
            >
              Confirmed
            </Button>
            <Button
              variant={currentStatus === 'failed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleStatusChange('failed')}
            >
              Failed
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card flex flex-1 flex-col items-center justify-center rounded-lg border py-12">
          <div className="text-muted-foreground text-sm">
            Loading payments...
          </div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-card flex flex-1 flex-col items-center justify-center rounded-lg border py-12">
          <CreditCard className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No payments found</h3>
          <p className="text-muted-foreground mb-4 text-center text-sm">
            {searchQuery || currentStatus !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Your payment transactions will appear here'}
          </p>
          {(searchQuery || currentStatus !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                handleStatusChange('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {meta && (
            <PaymentsPagination meta={meta} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  );
}
