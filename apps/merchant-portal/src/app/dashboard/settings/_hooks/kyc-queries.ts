import { queryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-config';

export interface KycStatus {
  status: 'not_started' | 'pending' | 'verified' | 'rejected';
  providerId: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
}

export const kycStatusOptions = queryOptions({
  queryKey: ['kyc-status'],
  queryFn: async (): Promise<KycStatus> => {
    const response = await apiClient.get<KycStatus>('/kyc/status');
    return response.data;
  },
});
