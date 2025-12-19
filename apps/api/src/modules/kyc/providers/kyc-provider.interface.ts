export interface KycSubmissionData {
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
  documentType: string;
  documentNumber: string;
}

export interface KycProviderResponse {
  providerId: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
}

export interface KycStatusResponse {
  providerId: string;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

export interface IKycProvider {
  submitKyc(data: KycSubmissionData): Promise<KycProviderResponse>;
  getKycStatus(providerId: string): Promise<KycStatusResponse | null>;
}
