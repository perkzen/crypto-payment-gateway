import { Key } from 'lucide-react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@workspace/ui/components/empty';

export function ApiKeysEmptyState() {
  return (
    <Empty className="bg-card rounded-lg border p-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Key />
        </EmptyMedia>
        <EmptyTitle>No API keys</EmptyTitle>
        <EmptyDescription>
          Create your first API key to start integrating with the payment
          gateway
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
