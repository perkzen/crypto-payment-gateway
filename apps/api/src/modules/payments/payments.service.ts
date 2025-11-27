import { DatabaseService } from '@app/modules/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPayment() {}
}
