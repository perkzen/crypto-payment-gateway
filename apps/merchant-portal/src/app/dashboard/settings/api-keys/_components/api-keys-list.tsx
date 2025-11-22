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
import { ApiKeysEmptyState } from '../_components/api-keys-empty-state';
import { listApiKeysOptions } from '../_hooks/queries';
import { useApiKeysTableColumns } from '../_hooks/use-api-keys-table-columns';
import { type ApiKey } from '../_types/api-key';

function ApiKeysListContainer({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Active API Keys</h2>
        <p className="text-muted-foreground text-sm">
          Your API keys are used to authenticate requests to the payment gateway
        </p>
      </div>
      {children}
    </div>
  );
}

function ApiKeysTable({ data }: { data: ApiKey[] }) {
  const columns = useApiKeysTableColumns();

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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ApiKeyListView() {
  const { data: apiKeys = [] } = useQuery(listApiKeysOptions);

  if (apiKeys.length === 0) return <ApiKeysEmptyState />;

  return (
    <ApiKeysListContainer>
      <ApiKeysTable data={apiKeys} />
    </ApiKeysListContainer>
  );
}
