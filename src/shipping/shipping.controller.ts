import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';

@Controller('shipping')
@ApiTags('Shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

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
  @UseGuards(JwtAuthGuard)
  @hasRoles(UserRoles.ADMIN)
  async findAll(@Query() query: PaginationOptions) {
    return this.shippingService.findAll(query);
  }

  @Get(':id')
  @ApiInternalServerErrorResponse()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @hasRoles(UserRoles.ADMIN)
  async assignRider(
    @Param('id') id: string,
    @Param('riderId') riderId: string,
  ) {
    return this.shippingService.assignRider(id, riderId);
  }
}
