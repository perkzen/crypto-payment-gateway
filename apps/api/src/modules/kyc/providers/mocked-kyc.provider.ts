import { Injectable, Logger } from '@nestjs/common';
import type {
  IKycProvider,
  KycProviderResponse,
  KycStatusResponse,
  KycSubmissionData,
} from './kyc-provider.interface';

interface MockedKycRecord {
  providerId: string;
  data: KycSubmissionData;
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: Date;
  verifiedAt?: Date;
  rejectionReason?: string;
}

@Injectable()
export class MockedKycProvider implements IKycProvider {
  private readonly logger = new Logger(MockedKycProvider.name);
  private readonly store = new Map<string, MockedKycRecord>();
  private readonly verificationDelayMs = 3000; // 3 seconds
  private readonly approvalRate = 0.8; // 80% approval rate
  private readonly rejectionReasons = [
    'Document quality is insufficient',
    'Information mismatch detected',
    'Identity verification failed',
    'Document expired',
    'Incomplete information provided',
  ];

  async submitKyc(data: KycSubmissionData): Promise<KycProviderResponse> {
    const providerId = `kyc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const submittedAt = new Date();

    const record: MockedKycRecord = {
      providerId,
      data,
      status: 'pending',
      submittedAt,
    };

    this.store.set(providerId, record);

    this.logger.log(`KYC submission received: ${providerId} for ${data.email}`);

    // Schedule async verification
    this.scheduleVerification(providerId);

    return {
      providerId,
      status: 'pending',
      submittedAt,
    };
  }

  async getKycStatus(providerId: string): Promise<KycStatusResponse | null> {
    const record = this.store.get(providerId);

    if (!record) {
      return null;
    }

    return {
      providerId: record.providerId,
      status: record.status,
      submittedAt: record.submittedAt,
      verifiedAt: record.verifiedAt,
      rejectionReason: record.rejectionReason,
    };
  }

  private scheduleVerification(providerId: string): void {
    setTimeout(() => {
      const record = this.store.get(providerId);
      if (!record || record.status !== 'pending') {
        return;
      }

      const isApproved = Math.random() < this.approvalRate;
      const verifiedAt = new Date();

      if (isApproved) {
        record.status = 'verified';
        record.verifiedAt = verifiedAt;
        this.logger.log(`KYC verified: ${providerId}`);
      } else {
        record.status = 'rejected';
        record.verifiedAt = verifiedAt;
        record.rejectionReason =
          this.rejectionReasons[
            Math.floor(Math.random() * this.rejectionReasons.length)
          ];
        this.logger.warn(
          `KYC rejected: ${providerId} - ${record.rejectionReason}`,
        );
      }

      this.store.set(providerId, record);
    }, this.verificationDelayMs);
  }
}
