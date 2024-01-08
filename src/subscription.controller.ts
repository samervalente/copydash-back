import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './File/file.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly fileService: FileService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('/upload/metrics')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSubscriptionMetrics(@UploadedFile() file: Express.Multer.File) {
    const fileData = await this.fileService.readFile(file);
    return {
      mrr: this.subscriptionService.calculateMRR(fileData),
    };
  }
}
