import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Key, Plus } from 'lucide-react';

type CreateApiKeyFormProps = {
  keyName: string;
  onKeyNameChange: (name: string) => void;
  onCreateKey: () => void;
  isCreating: boolean;
};

export function CreateApiKeyForm({
  keyName,
  onKeyNameChange,
  onCreateKey,
  isCreating,
}: CreateApiKeyFormProps) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <Key className="text-primary h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Create New API Key</h2>
          <p className="text-muted-foreground text-sm">
            Give your API key a descriptive name
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="e.g., Production API Key"
          value={keyName}
          onChange={(e) => onKeyNameChange(e.target.value)}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCreateKey();
          }}
        />
        <Button onClick={onCreateKey} disabled={isCreating || !keyName.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </div>
    </div>
  );
}

