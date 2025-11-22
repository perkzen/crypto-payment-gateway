import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import type { ApiKey } from '../_types/api-key';
import { ApiKeyTableActions } from '../_components/api-key-table-actions';

const columnHelper = createColumnHelper<ApiKey>();

export function useApiKeysTableColumns() {
  return useMemo(
    () => [
      columnHelper.accessor('enabled', {
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
              Active
            </span>
          ) : (
            <span className="inline-flex shrink-0 rounded-full bg-gray-500/10 px-2 py-0.5 text-xs font-medium text-gray-500">
              Inactive
            </span>
          ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <span className="text-sm font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('start', {
        header: 'Key',
        cell: (info) => (
          <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
            {info.getValue()}
            {'*'.repeat(16)}
          </code>
        ),
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <span
            className="text-muted-foreground text-xs"
            title={`Created: ${new Date(info.getValue()).toLocaleString()}`}
          >
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.accessor('lastRequest', {
        header: 'Last Used',
        cell: (info) => {
          const value = info.getValue();
          return value ? (
            <span
              className="text-muted-foreground text-xs"
              title={`Last used: ${new Date(value).toLocaleString()}`}
            >
              {new Date(value).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">Never</span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: (info) => <ApiKeyTableActions apiKey={info.row.original} />,
      }),
    ],
    [],
  );
}
