import { InjectDatabaseConnection } from '@app/modules/database/deocrators/inject-database-connection.decoractor';
import { Injectable } from '@nestjs/common';
import type { Database } from '@app/modules/database/utils/get-database-connection';

@Injectable()
export class PaymentsService {
  constructor(@InjectDatabaseConnection() private readonly db: Database) {}

  async createPayment() {}
}
