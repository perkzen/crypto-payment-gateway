import { Button } from '@workspace/ui/components/button';
import {
  Copy,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import type { ApiKey } from '../_types';

type ApiKeyItemProps = {
  apiKey: ApiKey;
  isVisible: boolean;
  isCopied: boolean;
  onToggleVisibility: () => void;
  onCopy: () => void;
  onDelete: () => void;
};

function maskKey(key: string): string {
  return `${key.slice(0, 12)}${'•'.repeat(20)}${key.slice(-8)}`;
}

export function ApiKeyItem({
  apiKey,
  isVisible,
  isCopied,
  onToggleVisibility,
  onCopy,
  onDelete,
}: ApiKeyItemProps) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-semibold">{apiKey.name}</h3>
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
              Active
            </span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
              {isVisible ? apiKey.key : maskKey(apiKey.key)}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleVisibility}
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onCopy}>
              {isCopied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="text-muted-foreground flex gap-4 text-xs">
            <span>
              Created: {new Date(apiKey.createdAt).toLocaleDateString()}
            </span>
            {apiKey.lastUsed && (
              <span>
                Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

