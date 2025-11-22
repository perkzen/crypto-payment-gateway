'use client';

import { Fragment, type ReactNode, useMemo } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ApiKeyDeleteDialog } from './api-key-delete-dialog';
import { ApiKeyEditDialog } from './api-key-edit-dialog';
import type { ApiKey } from '../_types/api-key';

type DropdownAction = {
  key: string;
  render: () => ReactNode;
};

type ApiKeyTableActionsProps = {
  apiKey: ApiKey;
};

export function ApiKeyTableActions({ apiKey }: ApiKeyTableActionsProps) {
  const actions = useMemo<DropdownAction[]>(
    () => [
      {
        key: 'edit',
        render: () => (
          <ApiKeyEditDialog apiKey={apiKey}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" />
              Edit name
            </DropdownMenuItem>
          </ApiKeyEditDialog>
        ),
      },
      {
        key: 'separator-1',
        render: () => <DropdownMenuSeparator />,
      },
      {
        key: 'delete',
        render: () => (
          <ApiKeyDeleteDialog apiKey={apiKey}>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </ApiKeyDeleteDialog>
        ),
      },
    ],
    [apiKey],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {actions.map((action) => (
          <Fragment key={action.key}>{action.render()}</Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
