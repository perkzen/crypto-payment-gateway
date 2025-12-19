import { mutationOptions } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/lib/api-config';
import type { KycStatus } from './kyc-queries';

export interface SubmitKycData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  documentType: 'passport' | 'drivers_license' | 'national_id';
  documentNumber: string;
}

export const submitKycOptions = mutationOptions({
  mutationFn: async (data: SubmitKycData): Promise<KycStatus> => {
    try {
      const response = await apiClient.post<KycStatus>('/kyc/submit', data);
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
          'Failed to submit KYC information';
        throw new Error(message);
      }
      throw error;
    }
  },
});
