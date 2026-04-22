import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/helpers';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintsService } from './complaints.service';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: '(No auth)' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @UseInterceptors(
    FileInterceptor('picture', {
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @Body() body: CreateComplaintDto,
    @UploadedFile() picture?: Express.Multer.File,
  ) {
    return this.complaintsService.create(body, picture);
  }
}
