import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import { mapRowToDomain } from 'src/utils/file-row-utils';
import * as xlsx from 'xlsx';

@Injectable()
export class FileService {
  async readFile(file: Express.Multer.File) {
    const filePath = `/tmp/${file.originalname}`;

    try {
      fs.writeFileSync(filePath, file.buffer);

      if (file.originalname.endsWith('.xlsx')) {
        return this.readXLSX(filePath);
      } else if (file.originalname.endsWith('.csv')) {
        return this.readCSV(filePath);
      } else {
        throw new Error('Formato de arquivo não suportado');
      }
    } catch (error) {
      throw new Error('Erro ao processar o arquivo');
    }
  }

  async readCSV(filePath: string) {
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

  async readXLSX(filePath: string) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);
    const results = rows.map((data) => mapRowToDomain(data));

    return results;
  }
}
