import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { CloudinaryProvider } from './cloudinary.provider';

@Module({
  providers: [FilesService, CloudinaryProvider],
  exports: [CloudinaryProvider, FilesService],
})
export class FilesModule {}
