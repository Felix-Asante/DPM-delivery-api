import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PAYSTACK_ENDPOINT } from 'src/utils/constants';
import { Paystack } from 'paystack-sdk';

@Injectable()
export class PaymentService {
  paystack: Paystack;
  constructor(private configService: ConfigService) {
    this.paystack = new Paystack(
      this.configService.get<string>('PAYSTACK_SECRET_KEY'),
    );
  }
  payStackHeaders() {
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    return {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
    };
  }
  async acceptPayment() {
    try {
      const endpoint = PAYSTACK_ENDPOINT.INITIALIZE_TRANSACTION;
      // const result = await this.paystack.
      const result = await axios.post(
        'https://api.paystack.co/paymentrequest',
        {
          amount: 5,
          // email: 'customer@email.com',
          customer: 'CUS_q7e4my0my7s2hi5',
          currency: 'GHS',
          channels: ['mobile_money'],
          mobile_money: {
            phone: '0535681529',
            provider: 'MTN',
          },
        },
        this.payStackHeaders(),
      );
      console.log(result);
      return result.data;
    } catch (error) {
      console.log(error?.response);
    }
  }
}
