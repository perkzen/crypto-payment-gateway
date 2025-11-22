'use client';

import { CreateApiKeyView, ApiKeyListView } from './_components';
import { PageHeader } from '@/components/page-header';

export default function ApiKeysPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader
        title="API Keys"
        description="Manage your API keys for secure integration"
      />
      <CreateApiKeyView />
      <ApiKeyListView />
    </div>
  );
}
