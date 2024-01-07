import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { FileService } from './File/file.service';

@Module({
  imports: [],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, FileService],
})
export class AppModule {}
