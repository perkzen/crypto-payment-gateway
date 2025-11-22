import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Check, Copy } from 'lucide-react';
import { type CreateApiKeyResult } from '../_types/api-key';
import { useCopyText } from '@/hooks/use-copy-text';

type ApiKeySuccessDialogProps = {
  apiKey: CreateApiKeyResult;
  onClose: () => void;
};

function KeyNameDisplay({ name }: { name: string }) {
  return (
    <div>
      <label className="text-sm font-medium">Key Name</label>
      <p className="text-muted-foreground mt-1 text-sm">{name}</p>
    </div>
  );
}

function ApiKeyDisplay({ apiKey }: { apiKey: string }) {
  const { copied, copyText } = useCopyText();

  const handleCopyKey = () => {
    void copyText(apiKey, 'API key copied to clipboard');
  };

  return (
    <div>
      <label className="text-sm font-medium">API Key</label>
      <div className="mt-1 flex gap-2">
        <code className="bg-muted flex-1 break-all rounded px-3 py-2 font-mono text-sm">
          {apiKey}
        </code>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyKey}
          title="Copy API key"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function SecurityWarning() {
  return (
    <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
      <p className="text-sm text-orange-600 dark:text-orange-500">
        <strong>Important:</strong> Store this API key securely. For security
        reasons, it won't be shown again.
      </p>
    </div>
  );
}

export function ApiKeySuccessDialog({
  apiKey,
  onClose,
}: ApiKeySuccessDialogProps) {
  return (
    <Dialog open={!!apiKey} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Make sure to copy your API key now. You won&#39;t be able to see it
            again!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <KeyNameDisplay name={apiKey.name!} />
          <ApiKeyDisplay apiKey={apiKey.key} />
          <SecurityWarning />
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
