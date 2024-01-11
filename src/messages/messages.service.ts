import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { ENV } from 'src/utils/constants';
import { ISendMessage } from './interface';
import { SmsService } from 'src/sms/sms.service';

const TwilioClient = new Twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

@Injectable()
export class MessagesService {
  constructor(
    private configService: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async sendSmsMessage(payload: ISendMessage) {
    try {
      // const smsResponse = await TwilioClient.messages.create({
      //   body: payload.message,
      //   from: `${this.configService.get('TWILIO_NUMBER')}`,
      //   to: payload.recipient,
      // });
      const smsResponse = await this.smsService.send(
        payload.recipient,
        payload.message,
      );

      return {
        success: true,
        status: 200,
        data: smsResponse,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
