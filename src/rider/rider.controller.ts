import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RiderService } from './rider.service';
import { CreateRiderDto } from './dto/create-rider.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { ApiTags } from '@nestjs/swagger';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Controller('rider')
@ApiTags('Rider')
export class RiderController {
  constructor(private readonly riderService: RiderService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identificationDocumentImage', maxCount: 1 },
      { name: 'bikeImage', maxCount: 1 },
    ]),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  create(
    @Body() createRiderDto: CreateRiderDto,
    @UploadedFiles()
    files: {
      bikeImage: Express.Multer.File[];
      identificationDocumentImage: Express.Multer.File[];
    },
  ) {
    return this.riderService.create(
      createRiderDto,
      files?.bikeImage?.[0],
      files?.identificationDocumentImage?.[0],
    );
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'identificationDocumentImage', maxCount: 1 },
      { name: 'bikeImage', maxCount: 1 },
    ]),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  update(
    @Body() updateRiderDto: UpdateRiderDto,
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      bikeImage: Express.Multer.File[];
      identificationDocumentImage: Express.Multer.File[];
    },
  ) {
    return this.riderService.update(id, updateRiderDto, files);
  }

  @Get()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  findAll(@Query() options: PaginationOptions) {
    return this.riderService.findAll(options);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    return this.riderService.findOneById(id);
  }
}
