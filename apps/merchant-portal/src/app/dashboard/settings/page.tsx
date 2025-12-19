import { PageHeader } from '@/components/page-header';
import { GeneralSettings } from './_components/general-settings';
import { KycSection } from './_components/kyc-section';

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="Settings"
        description="Manage your account settings"
      />

      <GeneralSettings />

      <KycSection />
    </div>
  );
}
