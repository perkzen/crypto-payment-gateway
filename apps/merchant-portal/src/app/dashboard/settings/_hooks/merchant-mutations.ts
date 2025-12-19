import axios from 'axios';
import type { Merchant } from './merchant-queries';
import type { UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-config';

export interface UpdateMerchantData {
  displayName?: string | null;
  contactEmail?: string | null;
}

async function updateMerchantMutationFn(data: UpdateMerchantData): Promise<Merchant> {
  try {
    const response = await apiClient.patch<Merchant>('/merchants', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      
      // Handle Zod validation errors
      if (responseData?.issues && Array.isArray(responseData.issues)) {
        const validationErrors = responseData.issues
          .map((issue: { path: string[]; message: string }) => {
            const field = issue.path.join('.');
            return `${field}: ${issue.message}`;
          })
          .join(', ');
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      // Handle standard error messages
      const message =
        responseData?.message ||
        responseData?.error ||
        error.message ||
        'Failed to update merchant information';
      throw new Error(message);
    }
    throw error;
  }
}

export const updateMerchantOptions: UseMutationOptions<
  Merchant,
  unknown,
  UpdateMerchantData,
  unknown
> = {
  mutationFn: updateMerchantMutationFn,
};
