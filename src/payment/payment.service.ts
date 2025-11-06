import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { externalApis } from 'src/lib/external-api';
import { CheckPaymentStatusDto } from './dto/check-payment-status.dto';
import { CreateMobilePaymentDto } from './dto/create-mobile-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  async acceptPayment(body: CreateMobilePaymentDto) {
    try {
      const appId = this.configService.get('KOWRI_APP_ID');
      const appReference = this.configService.get('KOWRI_APP_REFERENCE');
      const appSecret = this.configService.get('KOWRI_APP_SECRET');
      const environment = 'Test';

      const payload = {
        ...body,
        walletRef: body.customerMobile,
        appReference,
        secret: appSecret,
        customerSegment: environment,
        serviceCode: '3058',
      };

      const endpoint = externalApis.payment.payNow();
      const response = await axios.post(endpoint, payload, {
        headers: {
          appId,
        },
      });
      return response.data;
    } catch (error) {
      return error?.response?.data;
    }
  }

  async checkPaymentStatus(body: CheckPaymentStatusDto) {
    try {
      const appId = this.configService.get('KOWRI_APP_ID');
      const appReference = this.configService.get('KOWRI_APP_REFERENCE');
      const appSecret = this.configService.get('KOWRI_APP_SECRET');

      const payload = {
        ...body,
        appReference,
        secret: appSecret,
      };

      const endpoint = externalApis.payment.checkStatus();
      const response = await axios.post(endpoint, payload, {
        headers: {
          appId,
        },
      });
      return response.data;
    } catch (error) {
      return { error: error?.message };
    }
  }
}
