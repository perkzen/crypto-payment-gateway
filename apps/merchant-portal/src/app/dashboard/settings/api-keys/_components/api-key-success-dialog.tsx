import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { AlertTriangle, Check, Copy } from 'lucide-react';
import type { CreateApiKeyResult } from '../_types/api-key';
import { useCopyText } from '@/hooks/use-copy-text';

type ApiKeySuccessDialogProps = {
  apiKey: CreateApiKeyResult;
  onClose: () => void;
};

function ApiKeyDisplay({ apiKey }: { apiKey: string }) {
  const { copied, copyText } = useCopyText();

  const handleCopyKey = () => {
    void copyText(apiKey, 'API key copied to clipboard');
  };

  return (
    <div className="space-y-2">
      <label className="text-foreground text-sm font-medium">API Key</label>
      <div className="bg-muted relative flex items-center gap-2 rounded-md border px-3 py-2.5">
        <code className="flex-1 break-all font-mono text-sm">{apiKey}</code>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopyKey}
          title="Copy API key"
          className="h-7 w-7 shrink-0"
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
    <Alert className="border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-500 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-500">
      <AlertTriangle />
      <AlertTitle>Important: Save this key now</AlertTitle>
      <AlertDescription className="text-orange-600/90 dark:text-orange-500/90">
        This is the only time you&#39;ll be able to see this API key. Store it
        securely.
      </AlertDescription>
    </Alert>
  );
}

export function ApiKeySuccessDialog({
  apiKey,
  onClose,
}: ApiKeySuccessDialogProps) {
  return (
    <Dialog open={!!apiKey} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>API Key Created Successfully</DialogTitle>
          <DialogDescription>
            Copy your new API key and store it in a secure location.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <ApiKeyDisplay apiKey={apiKey.key} />
          <SecurityWarning />
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
