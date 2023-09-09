import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OfferTypeDto } from './dtos/create-offer-types.dto';
import { CreateOfferDto } from './dtos/create-offer.dto';

@Controller('offers')
@ApiTags('Offers Type / Offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}
  @Post('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async createOfferType(@Body() body: OfferTypeDto) {
    return this.offersService.createOffersType(body);
  }
  @Put(':id/types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiCreatedResponse()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async updateOfferType(@Body() body: OfferTypeDto, @Param('id') id: string) {
    return this.offersService.updateOfferType(id, body);
  }
  @Delete(':id/types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiOkResponse()
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async deleteOfferType(@Param('id') id: string) {
    return this.offersService.deleteOfferType(id);
  }

  @Get('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  async getOfferType() {
    return this.offersService.getOffersType();
  }
  @Get('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  async getOfferTypeById(@Param('id') id: string) {
    return this.offersService.getOfferTypeById(id);
  }
  @Get('types/:id/offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.USER, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  async getOffersByType(@Param('id') id: string) {
    return this.offersService.getOffersByType(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async createOffer(@Body() body: CreateOfferDto) {
    return this.offersService.createOffer(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async getAllOffers() {
    return this.offersService.getAllOffers();
  }
  @Get('place-offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN, UserRoles.USER)
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async getPlaceOffers() {
    return this.offersService.getPlaceOffers();
  }
  @Get('product-offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN, UserRoles.USER)
  @ApiBearerAuth()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async getProductOffers() {
    return this.offersService.getProductOffers();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async deleteOffer(@Param('id') id: string) {
    return this.offersService.deleteOffer(id);
  }
}
