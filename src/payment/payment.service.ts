import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PAYSTACK_ENDPOINT } from 'src/utils/constants';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}
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

      const result = await axios.post(
        endpoint,
        {
          amount: 500,
          email: 'customer@email.com',
          currency: 'GHS',
          channels: ['mobile_money'],
          mobile_money: {
            phone: '0535681529',
            provider: 'MTN',
          },
        },
        this.payStackHeaders(),
      );
      return result?.data;
    } catch (error) {
      console.log(error?.response);
    }
  }
}
