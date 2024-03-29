import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

import { BufferStream } from '@myrotvorets/buffer-stream';
import { ConfigService } from '@nestjs/config';
import * as PDFDocument from 'pdfkit';
import { tryCatch } from 'src/utils/helpers';
import { ICreateBooking } from 'src/utils/interface';

const pdfStartX = 10;
@Injectable()
export class FilesService {
  private doc: PDFKit.PDFDocument;
  constructor(private readonly configService: ConfigService) {
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

  async uploadDocument(document: string) {
    return new Promise((resolve, reject) => {
      Cloudinary.uploader.upload(document, {}, (error, result) => {
        if (error) reject(error);
        resolve(result);
      });
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

  async createBookingReceipt(booking: ICreateBooking) {
    const deliveryCost = booking.delivery_fee || 0;
    const subTotal = booking.total_amount - deliveryCost;
    const tip = booking?.rider_tip || 0;
    const itemsInterval = 12;
    let distance = 164;
    return tryCatch(async () => {
      this.generateBookingReceiptHeader();
      this.generatePdfHr(70);
      this.generateBookingMeta();
      this.generateTableRow('QTY', 'DESCRIPTION', 'AMOUNT', 143);
      this.generatePdfHr(152);
      booking.place.forEach((place, i) => {
        distance += itemsInterval * i;
        this.generateTableRow(
          '1',
          place?.name,
          place?.averagePrice?.toFixed(2)?.toString(),
          distance,
        );
        distance += 12;
        this.generatePdfHr(distance);
      });
      const hasItems = booking.place.length || booking.services.length;

      this.generateTableRow(
        'SubTotal:',
        '',
        subTotal?.toFixed(2)?.toString(),
        hasItems ? distance + 15 : 196,
      ); // +15
      this.generateTableRow(
        'Delivery Fee:',
        '',
        deliveryCost?.toFixed(2)?.toString(),
        hasItems ? distance + 30 : 211,
      );
      this.generateTableRow(
        'Courier Tip:',
        '',
        tip?.toFixed(2)?.toString(),
        hasItems ? distance + 45 : 226,
      );
      this.generatePdfHr(hasItems ? distance + 60 : 241);
      this.generateTableRow(
        'TOTAL',
        '',
        booking.total_amount?.toFixed(2)?.toString(),
        hasItems ? distance + 75 : 257,
        16,
      );
      this.generateBookingReceiptFooter();
      this.doc.end();
      this.doc.pipe(fs.createWriteStream(`${booking.reference}.pdf`));

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const fileName = process.cwd() + `/${booking.reference}.pdf`;
      return await this.uploadDocument(fileName);
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
