import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { WebhooksEmptyState } from './webhooks-empty-state';
import { listWebhooksOptions } from '../_hooks/queries';
import { useWebhooksTableColumns } from '../_hooks/use-webhooks-table-columns';
import { type Webhook } from '../_types/webhook';

function WebhooksListContainer({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function WebhooksTable({ data }: { data: Webhook[] }) {
  const columns = useWebhooksTableColumns();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No webhooks found.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function WebhooksListView() {
  const { data: webhooks = [], isLoading } = useQuery(listWebhooksOptions);

  if (isLoading) {
    return (
      <WebhooksListContainer>
        <div className="bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">Loading webhooks...</p>
        </div>
      </WebhooksListContainer>
    );
  }

  if (webhooks.length === 0) {
    return (
      <WebhooksListContainer>
        <WebhooksEmptyState />
      </WebhooksListContainer>
    );
  }

  return (
    <WebhooksListContainer>
      <WebhooksTable data={webhooks} />
    </WebhooksListContainer>
  );
}
