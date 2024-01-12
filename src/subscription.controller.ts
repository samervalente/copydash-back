import {
  Controller,
  Post,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file/file.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly fileService: FileService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @Post('/upload/metrics')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSubscriptionMetrics(
    @UploadedFile() file: Express.Multer.File,
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
    @Query('billingYear') billingYear = '2022',
  ) {
    const fileData = await this.fileService.readFile(file);
    return {
      billingYear,
      currency: 'BRL',
      symbol: 'R$',
      mrr: this.subscriptionService.calculateMRR(fileData),
      churnRate: this.subscriptionService.calculateChurnRate(
        fileData,
        start_date,
        end_date,
      ),
    };
  }

  @Get('/churn-rate')
  async getChurnRateByPeriod(
    @Query('start_date') start_date: Date,
    @Query('end_date') end_date: Date,
  ) {
    return this.subscriptionService.calculateChurnRate(
      null,
      start_date,
      end_date,
    );
  }
}
