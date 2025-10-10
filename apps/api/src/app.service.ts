import { HealthCheckDto } from '@app/common/dtos/health-check.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async healthCheck(): Promise<HealthCheckDto> {
    return { status: 'ok' };
  }
}
