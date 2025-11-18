'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
};

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const generateApiKey = () => {
    return `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

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
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
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

  const maskKey = (key: string) => {
    return `${key.slice(0, 12)}${'•'.repeat(20)}${key.slice(-8)}`;
  };

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Manage your API keys for secure integration
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Create New API Key</h2>
              <p className="text-sm text-muted-foreground">
                Give your API key a descriptive name
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g., Production API Key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateKey();
              }}
            />
            <Button onClick={handleCreateKey} disabled={isCreating || !newKeyName.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Key
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Active API Keys</h2>
            <p className="text-sm text-muted-foreground">
              Your API keys are used to authenticate requests to the payment gateway
            </p>
          </div>

          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Key className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No API keys</h3>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Create your first API key to start integrating
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                          Active
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-sm">
                          {showKeys[apiKey.id]
                            ? apiKey.key
                            : maskKey(apiKey.key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => toggleShowKey(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                        >
                          {copiedKey === apiKey.id ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>
                          Created:{' '}
                          {new Date(apiKey.createdAt).toLocaleDateString()}
                        </span>
                        {apiKey.lastUsed && (
                          <span>
                            Last used:{' '}
                            {new Date(apiKey.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <h3 className="mb-2 font-semibold text-yellow-600 dark:text-yellow-500">
            Security Best Practices
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Never share your API keys publicly or commit them to version control</li>
            <li>Rotate your keys regularly for better security</li>
            <li>Use different keys for development and production environments</li>
            <li>Revoke keys immediately if you suspect they've been compromised</li>
          </ul>
        </div>
      </div>
    </>
  );
}

