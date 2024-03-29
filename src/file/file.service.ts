import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { SubscriptionBilling } from 'src/subscription.types';
import { mapRowToDomain } from 'src/utils/file-row-utils';
import * as xlsx from 'xlsx';

@Injectable()
export class FileService {
  async readFile(file: Express.Multer.File): Promise<SubscriptionBilling[]> {
    const filePath = `/tmp/${file.originalname}`;

    try {
      fs.writeFileSync(filePath, file.buffer);
      return await this.processFileAsync(filePath);
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao processar o arquivo');
    }
  }

  async processFileAsync(filePath: string): Promise<SubscriptionBilling[]> {
    if (filePath.endsWith('.xlsx')) {
      return await this.readXLSX(filePath);
    } else if (filePath.endsWith('.csv')) {
      return await this.readCSV(filePath);
    } else {
      throw new Error('Formato de arquivo não suportado');
    }
  }

  async readCSV(filePath: string): Promise<SubscriptionBilling[]> {
    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => mapRowToDomain(data))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async readXLSX(filePath: string): Promise<SubscriptionBilling[]> {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { raw: false });
    const results = rows.map((data) => mapRowToDomain(data));

    return results;
  }
}
