import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { User } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Settings"
        description="Manage your account settings"
      />

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
    </div>
  );
}
