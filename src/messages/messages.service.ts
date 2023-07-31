import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { ENV } from 'src/utils/constants';
import { ISendMessage } from './interface';

const TwilioClient = new Twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

@Injectable()
export class MessagesService {
  constructor(private configService: ConfigService) {}

  async sendSmsMessage(payload: ISendMessage) {
    try {
      const smsResponse = await TwilioClient.messages.create({
        body: payload.message,
        from: this.configService.get('TWILIO_NUMBER'),
        to: payload.recipient,
      });

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
