import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PaymentmethodService } from './paymentmethod.service';
import { CreatePaymentmethodDto } from './dto/create-paymentmethod.dto';
import { UpdatePaymentmethodDto } from './dto/update-paymentmethod.dto';
import {
  ApiBadGatewayResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/helpers';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';

@Controller('paymentmethod')
@ApiTags('payment methods')
export class PaymentmethodController {
  constructor(private readonly paymentmethodService: PaymentmethodService) {}

  @Post()
  @ApiForbiddenResponse()
  @ApiCreatedResponse()
  @ApiBadGatewayResponse()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiOperation({ summary: '(Admin)' })
  @ApiBearerAuth()
  @ApiConflictResponse()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
    }),
  )
  create(
    @Body() createPaymentmethodDto: CreatePaymentmethodDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.paymentmethodService.create(createPaymentmethodDto, image);
  }

  @Get()
  findAll() {
    return this.paymentmethodService.findAll();
  }

  @Get(':id')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.paymentmethodService.findPaymentMethodById(id);
  }

  @Put(':id')
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiBadGatewayResponse()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiOperation({ summary: '(Admin)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: imageFileFilter,
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updatePaymentmethodDto: UpdatePaymentmethodDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.paymentmethodService.update(id, updatePaymentmethodDto, image);
  }

  @Delete(':id')
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiBearerAuth()
  @ApiBadGatewayResponse()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiOperation({ summary: '(Admin)' })
  remove(@Param('id') id: string) {
    return this.paymentmethodService.remove(id);
  }
}
