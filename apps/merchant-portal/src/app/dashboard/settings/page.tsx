import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Key, Settings2, User, Webhook } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Settings"
        description="Manage your account and integration settings"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <User className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold">General Settings</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Update your merchant profile and preferences
              </p>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Merchant Name
                  </label>
                  <Input placeholder="Your merchant name" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <Key className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold">API Keys</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Manage your API keys for integration
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/settings/api-keys">Manage API Keys</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <Webhook className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold">Webhooks</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Configure webhook endpoints for payment events
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/settings/webhooks">
                  Configure Webhooks
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <Settings2 className="text-primary h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold">Preferences</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Customize your dashboard preferences
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Email notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Webhook notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
