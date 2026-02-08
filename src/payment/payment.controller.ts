import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRoles } from 'src/utils/enums';
import { CheckPaymentStatusDto } from './dto/check-payment-status.dto';
import { CreateMobilePaymentDto } from './dto/create-mobile-payment.dto';
import { PaymentService } from './payment.service';
import { VerifyMobileMoneyAccountDto } from './dto/verify-mobile-money-account';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOperation({ summary: '(users/admin)' })
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER, UserRoles.ADMIN)
  async makePayment(@Body() body: CreateMobilePaymentDto) {
    return await this.paymentService.acceptPayment(body);
  }

  @Get('/check-status')
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOperation({ summary: '(users/admin)' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER, UserRoles.ADMIN)
  async checkPaymentStatus(@Body() body: CheckPaymentStatusDto) {
    return await this.paymentService.checkPaymentStatus(body);
  }
  @Post('/verify-mobile-money-account')
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiOperation({ summary: '(users/admin)' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async verifyMobileMoneyAccount(@Body() body: VerifyMobileMoneyAccountDto) {
    return await this.paymentService.verifyMobileMoneyAccount(
      body.accountNumber,
      body.provider,
    );
  }
}
