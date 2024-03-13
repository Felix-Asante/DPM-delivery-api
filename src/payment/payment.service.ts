import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateMobilePaymentDto } from './dto/create-mobile-payment.dto';
import axios from 'axios';
import { externalApis } from 'src/lib/external-api';
import { generateOtpCode } from 'src/utils/helpers';
import { CheckPaymentStatusDto } from './dto/check-payment-status.dto';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}

  async acceptPayment(body: CreateMobilePaymentDto) {
    try {
      const appId = this.configService.get('KOWRI_APP_ID');
      const appReference = 'DPMDeliveries';
      const appSecret = 'dotcom@88';
      const environment = 'Test';

      // const transactionId = `trans-${generateOtpCode(
      //   10,
      // )}-${new Date().getTime()}`;
      // const requestId = `req-${generateOtpCode(10)}-${new Date().getTime()}`;

      const payload = {
        ...body,
        walletRef: body.customerMobile,
        appReference,
        secret: appSecret,
        customerSegment: environment,
        serviceCode: '3058',
      };
      console.log(payload);
      const response = axios.post(externalApis.payment.payNow(), payload, {
        headers: {
          appId: '86a39935-2035-4509-92b7-79c60296438f',
        },
      });
      return response;
    } catch (error) {
      console.log('resss', error?.response);
      return { error: error?.response };
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
      const response = axios.post(externalApis.payment.checkStatus(), payload, {
        headers: {
          appId,
        },
      });
      return response;
    } catch (error) {
      console.log(error?.response);
      return { error: error?.response };
    }
  }
}
