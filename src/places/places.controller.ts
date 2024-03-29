import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRoles } from 'src/utils/enums';
import { CreatePlaceDto } from './dto/create-place.dto';
import { PlacesService } from './places.service';

import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { IDistance } from 'src/utils/interface';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { RatePlaceDto } from 'src/reviews/dto/create-review.dto';
import { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
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

  @Put(':id')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin,place admin)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImage', maxCount: 1 },
      { name: 'logo', maxCount: 1 },
    ]),
  )
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  async updatePlace(
    @Body() body: UpdatePlaceDto,
    @Param('id') id: string,
    @currentUser() user: User,
    @UploadedFiles()
    files: { logo: Express.Multer.File[]; mainImage: Express.Multer.File[] },
  ) {
    return await this.placesService.updatePlace(
      body,
      user,
      id,
      files?.mainImage?.[0],
      files?.logo?.[0],
    );
  }
  @Get()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'query', required: false, type: String })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async getAllPlaces(
    @Query() queries: PaginationOptions & { category: string },
  ) {
    return await this.placesService.getAllPlaces(queries);
  }

  @Get('search')
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'longitude', required: false, type: String })
  @ApiQuery({ name: 'latitude', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'query', required: true, type: String })
  async search(
    @Query() searchQuery: IDistance & { query: string; category: string },
  ) {
    const { query, category, ...coords } = searchQuery;
    return this.placesService.searchPlace(query, category, coords);
  }

  @ApiQuery({ name: 'longitude', required: true, type: String })
  @ApiQuery({ name: 'latitude', required: true, type: String })
  @Get('near/me')
  async getPlacesNearby(
    @Query() distance: { longitude: string; latitude: string },
  ) {
    return await this.placesService.findPlacesNearBy(distance);
  }

  @Get(':slug/slug')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async getPlaceBySlug(@Param('slug') slug: string) {
    return await this.placesService.findPlaceBySlug(slug);
  }

  @Get(':id/products')
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async getPlaceProduct(@Param('id') id: string) {
    return this.placesService.getPlaceProducts(id);
  }
  @Get('new')
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @ApiQuery({ name: 'longitude', required: false, type: String })
  @ApiQuery({ name: 'latitude', required: false, type: String })
  async getNewPlaces(@Query() coords: { longitude: string; latitude: string }) {
    return this.placesService.getNewPlaces(coords);
  }

  // @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @hasRoles(UserRoles.ADMIN)
  @ApiQuery({ name: 'longitude', required: false, type: String })
  @ApiQuery({ name: 'latitude', required: false, type: String })
  @Get('popular/locations')
  async popularPlaces(
    @Query() coords: { longitude: string; latitude: string },
  ) {
    return this.placesService.getPopularPlaces(coords);
  }

  @Get(':id')
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  async getPlaceById(@Param('id') id: string) {
    return await this.placesService.findPlaceById(id);
  }

  @Put(':placeId/like')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @ApiOperation({ summary: '(user)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER)
  async LikePlace(@Param('placeId') id: string, @currentUser() user: User) {
    return await this.placesService.LikePlace({ place: id, user });
  }
  @Put(':placeId/dislike')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @ApiOperation({ summary: '(user)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER)
  async disLikePlace(@Param('placeId') id: string, @currentUser() user: User) {
    return await this.placesService.UnLikePlace({ place: id, user });
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

  @Get('all/count')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async totalPlace(@currentUser() user: User) {
    return await this.placesService.findTotalPlaces(user);
  }
  @Get('admin/:id')
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiOperation({ summary: '(super admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async getPlaceAdmin(@Param('id') placeId: string) {
    return await this.placesService.getPlaceAdmin(placeId);
  }
  @ApiCreatedResponse({
    description: 'The place has been successfully rated.',
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiNotFoundResponse({ description: 'Place not found' })
  // @ApiBadRequestResponse({ description: 'User already rated the place' })
  @ApiBearerAuth()
  @ApiOperation({ summary: '(User)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER)
  @Post(':id/rate')
  async ratePlace(
    @currentUser() user: User,
    @Body() ratePlaceDto: RatePlaceDto,
    @Param('id') id: string,
  ) {
    return await this.placesService.ratePlace(user, ratePlaceDto, id);
  }

  @ApiOkResponse({
    description: 'The place ratings are returned successfully',
  })
  @ApiNotFoundResponse({ description: 'Place not found' })
  @ApiOperation({ summary: '(user)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get(':id/ratings')
  async getPlaceRatings(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() queries: PaginationOptions,
  ) {
    return await this.placesService.findPlaceRatings(id, queries);
  }

  @ApiOkResponse({
    description:
      'The openning hours of the place has been successfully updated',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBearerAuth()
  @ApiOperation({ summary: '(Admin/place admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @Post(':id/openingHours')
  async setPlaceOpeningHours(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateopeningHoursDto: UpdateOpeningHoursDto,
    @currentUser() user: User,
  ) {
    return await this.placesService.updatePlaceOpeningHours(
      id,
      user,
      updateopeningHoursDto,
    );
  }
}
