import { Key } from 'lucide-react';

export function ApiKeysEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Key className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">No API keys</h3>
      <p className="text-muted-foreground mb-4 text-center text-sm">
        Create your first API key to start integrating
      </p>
    </div>
  );
}

