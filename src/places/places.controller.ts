import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { PlacesService } from './places.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';

@Controller('places')
@ApiTags('Places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

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
