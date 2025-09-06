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
  ApiTags,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { UpdateRiderDto } from './dto/update-rider.dto';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';

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
      { name: 'profilePicture', maxCount: 1 },
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
      profilePicture: Express.Multer.File[];
    },
  ) {
    return this.riderService.create(
      createRiderDto,
      files?.bikeImage?.[0],
      files?.identificationDocumentImage?.[0],
      files?.profilePicture?.[0],
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
      { name: 'profilePicture', maxCount: 1 },
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
      profilePicture: Express.Multer.File[];
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

  @Get(':id/stats')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(rider)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.COURIER)
  async getRiderStats(@Param('id') id: string, @currentUser() user: User) {
    return this.riderService.getRiderStats(id, user);
  }
}
