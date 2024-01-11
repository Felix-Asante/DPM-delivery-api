import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PaymentService } from './payment/payment.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private paymentService: PaymentService,
  ) {}
  @Post('/')
  hello() {
    return this.paymentService.acceptPayment();
  }
}
