import { MessagesTemplates } from './../utils/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { ENV } from 'src/utils/constants';
import { ISendMessage } from './interface';
import { SmsService } from 'src/sms/sms.service';
import { messages } from './data';

const TwilioClient = new Twilio(ENV.TWILIO_ACCOUNT_SID, ENV.TWILIO_AUTH_TOKEN);

type MessagesParamsMap = {
  [MessagesTemplates.SHIPMENT_RECEIVED]: {
    reference: string;
    trackLink: string;
  };
  [MessagesTemplates.RIDER_ASSIGNED]: {
    reference: string;
    fullName: string;
  };
  [MessagesTemplates.RIDER_ASSIGNED_USER]: {
    reference: string;
  };
  [MessagesTemplates.RIDER_REASSIGNED]: {
    fullName: string;
  };
  [MessagesTemplates.NEW_ORDER_RECEIVED]: unknown;
};

type MessagesParams<T extends MessagesTemplates> = MessagesParamsMap[T];

type SendSmsParams<T extends MessagesTemplates> = {
  recipients: string[];
} & MessagesParams<T>;

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
  async sendSms<T extends MessagesTemplates>(
    template: T,
    params: SendSmsParams<T>,
  ) {
    try {
      const message = this.createMessage(template, params);
      const smsResponse = await this.smsService.send(
        params.recipients,
        message,
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

  createMessage<T extends MessagesTemplates>(
    template: T,
    params: MessagesParams<T>,
  ) {
    if (template === MessagesTemplates.SHIPMENT_RECEIVED) {
      const { reference, trackLink } =
        params as MessagesParamsMap[MessagesTemplates.SHIPMENT_RECEIVED];
      return messages.shipmentReceived(reference, trackLink);
    }
    if (template === MessagesTemplates.RIDER_ASSIGNED) {
      const { reference, fullName } =
        params as MessagesParamsMap[MessagesTemplates.RIDER_ASSIGNED];
      return messages.riderAssigned(fullName, reference);
    }
    if (template === MessagesTemplates.RIDER_REASSIGNED) {
      const { fullName } =
        params as MessagesParamsMap[MessagesTemplates.RIDER_REASSIGNED];
      return messages.riderReassigned(fullName);
    }
    if (template === MessagesTemplates.NEW_ORDER_RECEIVED) {
      return messages.newOrderReceived();
    }
    return '';
  }
}
