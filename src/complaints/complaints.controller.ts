import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ComplaintCategory, UserRoles } from 'src/utils/enums';
import { imageFileFilter } from 'src/utils/helpers';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { FindAllComplaintsDto } from './dto/find-all-complaints.dto';
import { ComplaintsService } from './complaints.service';

@ApiTags('Complaints')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(Admin) List and filter all complaints' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ComplaintCategory,
  })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiInternalServerErrorResponse()
  findAllForAdmin(@Query() query: FindAllComplaintsDto) {
    return this.complaintsService.findAllForAdmin(query);
  }

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
