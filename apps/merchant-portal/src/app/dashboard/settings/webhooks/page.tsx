'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import {
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Webhook,
  XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type WebhookEndpoint = {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const availableEvents = [
    'payment.created',
    'payment.pending',
    'payment.completed',
    'payment.failed',
    'payment.expired',
  ];

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl.trim() || selectedEvents.length === 0) return;

    setIsCreating(true);
    // Simulate API call
    setTimeout(() => {
      const newWebhook: WebhookEndpoint = {
        id: Math.random().toString(36).substring(7),
        url: newWebhookUrl,
        events: selectedEvents,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setWebhooks([...webhooks, newWebhook]);
      setNewWebhookUrl('');
      setSelectedEvents([]);
      setIsCreating(false);
    }, 500);
  };

  const handleDeleteWebhook = (id: string) => {
    if (confirm('Are you sure you want to delete this webhook endpoint?')) {
      setWebhooks(webhooks.filter((webhook) => webhook.id !== id));
    }
  };

  const toggleWebhookStatus = (id: string) => {
    setWebhooks(
      webhooks.map((webhook) =>
        webhook.id === id
          ? {
              ...webhook,
              status: webhook.status === 'active' ? 'inactive' : 'active',
            }
          : webhook,
      ),
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Webhooks"
        description="Configure webhook endpoints to receive payment events"
      />

      <div className="bg-card rounded-lg border p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <Webhook className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Create New Webhook</h2>
            <p className="text-muted-foreground text-sm">
              Add an endpoint to receive payment notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Webhook URL
            </label>
            <Input
              type="url"
              placeholder="https://your-domain.com/webhook"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateWebhook();
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Events to Subscribe
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {availableEvents.map((event) => (
                <label
                  key={event}
                  className="hover:bg-accent flex items-center gap-2 rounded-md border p-3"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded"
                  />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreateWebhook}
            disabled={
              isCreating || !newWebhookUrl.trim() || selectedEvents.length === 0
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Webhook Endpoints</h2>
          <p className="text-muted-foreground text-sm">
            Manage your webhook endpoints and their subscriptions
          </p>
        </div>

        {webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Webhook className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No webhooks</h3>
            <p className="text-muted-foreground mb-4 text-center text-sm">
              Create your first webhook endpoint to receive payment events
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <a
                        href={webhook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        {webhook.url}
                      </a>
                      <ExternalLink className="text-muted-foreground h-3 w-3" />
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          webhook.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {webhook.status === 'active' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {webhook.status}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Subscribed Events:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="bg-muted rounded px-2 py-0.5 text-xs"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-muted-foreground flex gap-4 text-xs">
                      <span>
                        Created:{' '}
                        {new Date(webhook.createdAt).toLocaleDateString()}
                      </span>
                      {webhook.lastTriggered && (
                        <span>
                          Last triggered:{' '}
                          {new Date(webhook.lastTriggered).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWebhookStatus(webhook.id)}
                    >
                      {webhook.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-500">
          Webhook Documentation
        </h3>
        <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
          <li>Webhooks are sent via HTTP POST requests to your endpoint</li>
          <li>Each webhook includes an HMAC signature for verification</li>
          <li>Your endpoint should respond with a 2xx status code</li>
          <li>Failed deliveries will be retried with exponential backoff</li>
        </ul>
      </div>
    </div>
  );
}
