import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { externalApis } from 'src/lib/external-api';
import { CheckPaymentStatusDto } from './dto/check-payment-status.dto';
import { CreateMobilePaymentDto } from './dto/create-mobile-payment.dto';
import { ERRORS } from 'src/utils/errors';
import { ENV } from 'src/app.environment';
import { ResolveAccountResponse } from './dto/interface';
import { MobileMoneyProvider } from 'src/utils/enums';

export const MOBILE_MONEY_CODES: Record<string, string> = {
  MOMO: 'MTN', // MTN Mobile Money
  AIRTELTIGO: 'ATL', // AirtelTigo Money
  TELECEL: 'VOD', // Telecel Cash (formerly Vodafone Cash)
};

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

  async verifyMobileMoneyAccount(
    accountNumber: string,
    provider: MobileMoneyProvider,
  ) {
    const bankCode = MOBILE_MONEY_CODES[provider];

    if (!bankCode) {
      throw new BadRequestException(ERRORS.PAYMENT_METHOD.DOES_NOT_EXIST.EN);
    }

    try {
      const endpoint = externalApis.paystack.verifyPhoneNumber(
        accountNumber,
        bankCode,
      );
      const response = await axios.get<ResolveAccountResponse>(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ENV.PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      });

      const result = response.data;

      if (!result.status || !result.data) {
        throw new BadRequestException(result.message);
      }

      return {
        success: true,
        accountName: result.data.account_name,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
