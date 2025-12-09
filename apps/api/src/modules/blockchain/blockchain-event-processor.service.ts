import { DatabaseService } from '@app/modules/database/database.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BlockchainEventProcessorService {
  private readonly logger = new Logger(BlockchainEventProcessorService.name);

  constructor(private readonly databaseService: DatabaseService) {}
}
