import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Copy, Check } from 'lucide-react';
import { toast } from '@workspace/ui/components/sonner';

type ApiKeySuccessDialogProps = {
  apiKey: { name: string; key: string } | null;
  onClose: () => void;
};

export function ApiKeySuccessDialog({
  apiKey,
  onClose,
}: ApiKeySuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyKey = async () => {
    if (apiKey?.key) {
      await navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      toast.success('API key copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={!!apiKey} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Make sure to copy your API key now. You won't be able to see it
            again!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Key Name</label>
            <p className="text-muted-foreground mt-1 text-sm">{apiKey?.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium">API Key</label>
            <div className="mt-1 flex gap-2">
              <code className="bg-muted flex-1 break-all rounded px-3 py-2 font-mono text-sm">
                {apiKey?.key}
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
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
            <p className="text-sm text-orange-600 dark:text-orange-500">
              <strong>Important:</strong> Store this API key securely. For
              security reasons, it won't be shown again.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

