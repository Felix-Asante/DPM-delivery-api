import { Injectable } from '@nestjs/common';

import {
  v2 as Cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { BufferStream } from '@myrotvorets/buffer-stream';

@Injectable()
export class FilesService {
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
