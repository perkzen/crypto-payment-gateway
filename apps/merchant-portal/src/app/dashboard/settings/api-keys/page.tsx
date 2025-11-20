'use client';

import { DashboardHeader } from '@/components/dashboard-header';
import {
  ApiKeyPageHeader,
  CreateApiKeyForm,
  ApiKeysList,
} from './_components';
import { useApiKeys } from './_hooks';

export default function ApiKeysPage() {
  const {
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
  } = useApiKeys();

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ApiKeyPageHeader />
        <CreateApiKeyForm
          keyName={newKeyName}
          onKeyNameChange={setNewKeyName}
          onCreateKey={handleCreateKey}
          isCreating={isCreating}
        />
        <ApiKeysList
          apiKeys={apiKeys}
          showKeys={showKeys}
          copiedKey={copiedKey}
          onToggleShowKey={toggleShowKey}
          onCopyKey={handleCopyKey}
          onDeleteKey={handleDeleteKey}
        />
      </div>
    </>
  );
}
