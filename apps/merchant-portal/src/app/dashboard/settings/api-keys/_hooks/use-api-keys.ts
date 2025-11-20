import { useState } from 'react';
import type { ApiKey } from '../_types';

function generateApiKey(): string {
  return `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const newKey: ApiKey = {
        id: Math.random().toString(36).substring(7),
        name: newKeyName,
        key: generateApiKey(),
        createdAt: new Date().toISOString(),
      };
      setApiKeys([...apiKeys, newKey]);
      setNewKeyName('');
      setIsCreating(false);
    }, 500);
  };

  const handleDeleteKey = (id: string) => {
    if (
      confirm(
        'Are you sure you want to delete this API key? This action cannot be undone.',
      )
    ) {
      setApiKeys(apiKeys.filter((key) => key.id !== id));
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return {
    apiKeys,
    newKeyName,
    setNewKeyName,
    showKeys,
    copiedKey,
    isCreating,
    handleCreateKey,
    handleDeleteKey,
    handleCopyKey,
    toggleShowKey,
  };
}

