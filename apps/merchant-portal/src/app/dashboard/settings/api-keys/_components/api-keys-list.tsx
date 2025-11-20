import type { ApiKey } from '../_types';
import { ApiKeyItem } from './api-key-item';
import { ApiKeysEmptyState } from './api-keys-empty-state';

type ApiKeysListProps = {
  apiKeys: ApiKey[];
  showKeys: Record<string, boolean>;
  copiedKey: string | null;
  onToggleShowKey: (id: string) => void;
  onCopyKey: (key: string, id: string) => void;
  onDeleteKey: (id: string) => void;
};

export function ApiKeysList({
  apiKeys,
  showKeys,
  copiedKey,
  onToggleShowKey,
  onCopyKey,
  onDeleteKey,
}: ApiKeysListProps) {
  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-6">
        <h2 className="text-lg font-semibold">Active API Keys</h2>
        <p className="text-muted-foreground text-sm">
          Your API keys are used to authenticate requests to the payment gateway
        </p>
      </div>

      {apiKeys.length === 0 ? (
        <ApiKeysEmptyState />
      ) : (
        <div className="divide-y">
          {apiKeys.map((apiKey) => (
            <ApiKeyItem
              key={apiKey.id}
              apiKey={apiKey}
              isVisible={showKeys[apiKey.id] ?? false}
              isCopied={copiedKey === apiKey.id}
              onToggleVisibility={() => onToggleShowKey(apiKey.id)}
              onCopy={() => onCopyKey(apiKey.key, apiKey.id)}
              onDelete={() => onDeleteKey(apiKey.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

