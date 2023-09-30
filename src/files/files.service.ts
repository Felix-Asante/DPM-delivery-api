import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

import { BufferStream } from '@myrotvorets/buffer-stream';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import { tryCatch } from 'src/utils/helpers';

const pdfStartX = 10;
@Injectable()
export class FilesService {
  private s3: AWS.S3;
  private doc: PDFKit.PDFDocument;
  constructor(private readonly configService: ConfigService) {
    AWS.config.update({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_ACCESS_KEY_SECRET'),
    });
    this.s3 = new AWS.S3();
    this.doc = new PDFDocument({
      size: 'A5',
      margins: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 5,
      },
    });
  }

  uploadFileToS3 = async (file: Express.Multer.File, type: string) => {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.configService.get('S3_BUCKET_NAME'),
        Key: `${type}/${Date.now().toString()}_${file.originalname.replace(
          /\s/g,
          '_',
        )}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const data = await this.s3.upload(params).promise();
      const splits = data.Key.split('/');
      const fileName = splits[splits.length - 1];
      return fileName;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = Cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      new BufferStream(file.buffer).pipe(upload);
    });
  }

  async deleteImage(publicId: string) {
    try {
      const deletedImage = await Cloudinary.uploader.destroy(publicId);
      return deletedImage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createBookingReceipt() {
    return tryCatch(async () => {
      this.generateBookingReceiptHeader();
      this.generatePdfHr(70);
      this.generateBookingMeta();
      this.generateTableRow('QTY', 'DESCRIPTION', 'AMOUNT', 143);
      this.generatePdfHr(152);
      this.generateTableRow('1', "Mama's kitchen", '12', 164);
      this.generatePdfHr(180);
      this.generateTableRow('SubTotal:', '', '200', 196); // +15
      this.generateTableRow('Service Fee:', '', '1', 211);
      this.generateTableRow('Courier Tip:', '', '0', 226);
      this.generatePdfHr(241);
      this.generateTableRow('TOTAL', '', '400', 257, 16);
      this.generateBookingReceiptFooter();
      this.doc.end();
      this.doc.pipe(fs.createWriteStream('receipt.pdf'));
    });
  }

  generatePdfHr(y: number) {
    this.doc
      .strokeColor('#ccc')
      .lineWidth(1)
      .moveTo(0, y)
      .lineTo(450, y)
      .stroke();
  }

  generateBookingReceiptHeader() {
    this.doc
      .image('./public/logo.jpeg', pdfStartX, 25, { width: 35, align: 'right' })
      .fontSize(11)
      .text('DPM DELIVERY', 300, 25, { align: 'left' })
      .fontSize(10)
      .text('0200000000', 300, 38, { align: 'left' })
      .fontSize(10)
      .text('support@dpmbrand.com', 300, 50, { align: 'left' })
      .moveDown();
  }

  generateBookingMeta() {
    this.doc
      .fontSize(11)
      .text('Reference: DPM-BK-20303', pdfStartX, 90)
      .moveDown()
      .fontSize(11)
      .text('Paid with: Mobile Money', pdfStartX, 103)
      .moveDown()
      .fontSize(11)
      .text(new Date().toDateString(), pdfStartX, 115)
      .moveDown();
  }

  generateTableRow(
    qty: string,
    desc: string,
    amount: string,
    posY: number,
    fz = 9,
  ) {
    this.doc
      .fontSize(fz)
      .text(qty, pdfStartX, posY, { width: 70 })
      .fontSize(fz)
      .text(desc, pdfStartX + 100, posY, { width: 250 })
      .fontSize(fz)
      .text(amount, pdfStartX + 350, posY, { width: 50, align: 'center' });
  }

  generateBookingReceiptFooter() {
    this.doc.fontSize(8).text('Thanks for doing business with us!', 50, 570, {
      align: 'center',
      width: 285,
    });
  }
}
