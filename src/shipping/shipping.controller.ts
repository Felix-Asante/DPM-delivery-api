import { Body, Controller, Post } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

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
}
