import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { CreatePlaceDto } from './dto/create-place.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/helpers';

@Controller('places')
@ApiTags('Places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
  )
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @hasRoles(UserRoles.ADMIN)
  async createPlace(
    @Body() body: CreatePlaceDto,
    @UploadedFiles()
    files: { logo: Express.Multer.File[]; mainImage: Express.Multer.File[] },
  ) {
    return await this.placesService.createPlace(
      body,
      files.mainImage[0],
      files?.logo?.[0],
    );
  }
  @Get()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async getAllPlaces() {
    return await this.placesService.getAllPlaces();
  }

  @Get(':id')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async getPlaceById(@Param('id') id: string) {
    return await this.placesService.findPlaceById(id);
  }

  @Get(':slug/slug')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async getPlaceBySlug(@Param('slug') slug: string) {
    return await this.placesService.findPlaceBySlug(slug);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async deletePlace(@Param('id') id: string) {
    return await this.placesService.deletePlace(id);
  }
}
