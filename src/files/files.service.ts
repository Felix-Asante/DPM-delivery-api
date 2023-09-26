import { Injectable } from '@nestjs/common';

import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

import { BufferStream } from '@myrotvorets/buffer-stream';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  private s3: AWS.S3;
  constructor(private readonly configService: ConfigService) {
    AWS.config.update({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_ACCESS_KEY_SECRET'),
    });
    this.s3 = new AWS.S3();
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
}
