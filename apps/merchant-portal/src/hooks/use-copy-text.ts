import { useState } from 'react';
import { toast } from '@workspace/ui/components/sonner';

export function useCopyText() {
  const [copied, setCopied] = useState(false);

  const copyText = async (
    text: string,
    successMessage = 'Copied to clipboard',
  ) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(successMessage);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, copyText };
}
