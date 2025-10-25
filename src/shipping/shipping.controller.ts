import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { CreateShipmentHistoryDto } from './dto/create-shipment-history.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/helpers';
import { FindAllShipmentDto } from './dto/find-all-shippment.dto';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SetShipmentCostDto } from './dto/set-shipment-cost.dto';
import { ShipmentCostService } from './shipment-cost.service';

@Controller('shipping')
@ApiTags('Shipping')
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly shipmentCostService: ShipmentCostService,
  ) {}

  @Post()
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  async createShipment(@Body() body: CreateShipmentDto) {
    return this.shippingService.create(body);
  }

  @Get()
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @ApiQuery({
    name: 'query',
    description: 'Search query',
    required: false,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.COURIER)
  async findAll(@Query() query: FindAllShipmentDto, @currentUser() user: User) {
    return this.shippingService.findAll(query, user);
  }

  @Get('riders/:riderId')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @ApiQuery({
    name: 'query',
    description: 'Search query',
    required: false,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async getRiderOrders(
    @Param('riderId') riderId: string,
    @Query() query: FindAllShipmentDto,
  ) {
    return this.shippingService.getRiderOrders(riderId, query);
  }

  @Get(':id')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.shippingService.findOne(id);
  }

  @Get('reference/:reference')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  async findByReference(@Param('reference') reference: string) {
    return this.shippingService.findByReference(reference);
  }

  @Patch(':id/assign-rider/:riderId')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async assignRider(
    @Param('id') id: string,
    @Param('riderId') riderId: string,
  ) {
    return this.shippingService.assignRider(id, riderId);
  }

  @Patch(':id/update-history')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFileFilter,
    }),
  )
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.COURIER)
  async updateHistory(
    @Param('id') id: string,
    @Body() body: CreateShipmentHistoryDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.shippingService.updateHistory(body, id, photo);
  }

  @Patch(':id/set-cost')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async setCost(@Param('id') id: string, @Body() body: SetShipmentCostDto) {
    return await this.shipmentCostService.createOrUpdate(id, body);
  }
}
