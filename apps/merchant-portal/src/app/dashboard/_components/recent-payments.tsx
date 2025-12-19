'use client';

import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@workspace/ui/components/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import Link from 'next/link';
import { listPaymentsOptions } from '../payments/_hooks/queries';
import { usePaymentsTableColumns } from '../payments/_hooks/use-payments-table-columns';

export function RecentPayments() {
  const { data, isLoading } = useQuery({
    ...listPaymentsOptions({ page: 1, limit: 5, sortOrder: 'desc' }),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const payments = data?.data || [];
  const columns = usePaymentsTableColumns();

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/payments">View All Payments</Link>
          </Button>
        </div>
      </div>
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4 text-sm">
            No payments yet
          </p>
          <Button variant="outline" asChild>
            <Link href="/dashboard/payments">View All Payments</Link>
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
