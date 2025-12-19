import { DatabaseService } from '@app/modules/database/database.service';
import { merchant } from '@app/modules/database/schemas';
import { MerchantsService } from '@app/modules/merchants/merchants.service';
import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { KycStatusDto, SubmitKycDto } from './dtos';
import { MockedKycProvider } from './providers/mocked-kyc.provider';
import type { KycSubmissionData } from './providers/kyc-provider.interface';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly merchantsService: MerchantsService,
    private readonly kycProvider: MockedKycProvider,
  ) {}

  async submitKyc(
    userId: string,
    data: SubmitKycDto,
  ): Promise<KycStatusDto> {
    const merchantRecord = await this.merchantsService.findMerchantByUserId(userId);

    // Check if KYC is already submitted and pending/verified
    if (
      merchantRecord.kycStatus === 'pending' ||
      merchantRecord.kycStatus === 'verified'
    ) {
      this.logger.warn(
        `KYC already submitted for merchant ${merchantRecord.id} with status ${merchantRecord.kycStatus}`,
      );
      return this.getKycStatus(userId);
    }

    // Prepare submission data
    const submissionData: KycSubmissionData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      address: {
        street: data.address.street,
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.postalCode,
        country: data.address.country,
      },
      documentType: data.documentType,
      documentNumber: data.documentNumber,
    };

    // Submit to KYC provider
    const providerResponse = await this.kycProvider.submitKyc(submissionData);

    // Update merchant record
    const submittedAt = new Date();
    await this.databaseService.db
      .update(merchant)
      .set({
        kycStatus: 'pending',
        kycProviderId: providerResponse.providerId,
        kycSubmittedAt: submittedAt,
      })
      .where(eq(merchant.id, merchantRecord.id));

    this.logger.log(
      `KYC submitted for merchant ${merchantRecord.id} with provider ID ${providerResponse.providerId}`,
    );

    // Schedule status check after delay
    this.scheduleStatusCheck(merchantRecord.id, providerResponse.providerId);

    return {
      status: 'pending',
      providerId: providerResponse.providerId,
      submittedAt,
      verifiedAt: null,
      rejectionReason: null,
    };
  }

  async getKycStatus(userId: string): Promise<KycStatusDto> {
    const merchantRecord = await this.merchantsService.findMerchantByUserId(userId);

    // If there's a provider ID, check with provider for latest status
    if (merchantRecord.kycProviderId) {
      const providerStatus = await this.kycProvider.getKycStatus(
        merchantRecord.kycProviderId,
      );

      if (providerStatus) {
        // Update database if status changed
        if (
          providerStatus.status !== merchantRecord.kycStatus &&
          providerStatus.status !== 'pending'
        ) {
          await this.databaseService.db
            .update(merchant)
            .set({
              kycStatus: providerStatus.status,
              kycVerifiedAt: providerStatus.verifiedAt,
              kycRejectionReason: providerStatus.rejectionReason ?? null,
            })
            .where(eq(merchant.id, merchantRecord.id));
        }
      }
    }

    // Return current status from database
    return {
      status: merchantRecord.kycStatus,
      providerId: merchantRecord.kycProviderId ?? null,
      submittedAt: merchantRecord.kycSubmittedAt ?? null,
      verifiedAt: merchantRecord.kycVerifiedAt ?? null,
      rejectionReason: merchantRecord.kycRejectionReason ?? null,
    };
  }

  async checkKycStatus(merchantId: string): Promise<boolean> {
    const merchantRecord = await this.databaseService.db.query.merchant.findFirst({
      where: eq(merchant.id, merchantId),
    });

    if (!merchantRecord) {
      return false;
    }

    // If there's a provider ID, check with provider for latest status
    if (merchantRecord.kycProviderId) {
      const providerStatus = await this.kycProvider.getKycStatus(
        merchantRecord.kycProviderId,
      );

      if (providerStatus && providerStatus.status === 'verified') {
        // Update database if not already updated
        if (merchantRecord.kycStatus !== 'verified') {
          await this.databaseService.db
            .update(merchant)
            .set({
              kycStatus: 'verified',
              kycVerifiedAt: providerStatus.verifiedAt,
            })
            .where(eq(merchant.id, merchantId));
        }
        return true;
      }
    }

    return merchantRecord.kycStatus === 'verified';
  }

  private scheduleStatusCheck(merchantId: string, providerId: string): void {
    // Check status after a delay (provider delay + buffer)
    setTimeout(async () => {
      try {
        const providerStatus = await this.kycProvider.getKycStatus(providerId);
        if (providerStatus && providerStatus.status !== 'pending') {
          await this.databaseService.db
            .update(merchant)
            .set({
              kycStatus: providerStatus.status,
              kycVerifiedAt: providerStatus.verifiedAt,
              kycRejectionReason: providerStatus.rejectionReason ?? null,
            })
            .where(eq(merchant.id, merchantId));

          this.logger.log(
            `KYC status updated for merchant ${merchantId}: ${providerStatus.status}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to check KYC status for merchant ${merchantId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }, 4000); // 4 seconds (slightly longer than provider delay)
  }
}
