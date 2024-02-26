import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  async acceptPayment() {
    try {
      return { message: 'accept payment EP' };
    } catch (error) {
      console.log(error?.response);
    }
  }
}
