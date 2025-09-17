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
    fullName: string;
    orderNumber: string;
    deliveryArea: string;
    contactNumber: string;
    dashboardLink: string;
  };
  [MessagesTemplates.RIDER_ASSIGNED_USER]: {
    reference: string;
  };
  [MessagesTemplates.RIDER_REASSIGNED]: {
    fullName: string;
    reference: string;
  };
  [MessagesTemplates.NEW_ORDER_RECEIVED]: unknown;
  [MessagesTemplates.RIDER_ACCOUNT_CREATED]: {
    fullName: string;
  };
  [MessagesTemplates.SHIPMENT_RECEIVED_RECEIVER]: {
    reference: string;
    trackLink: string;
  };
  [MessagesTemplates.OUT_FOR_DELIVERY]: {
    trackingLink: string;
    code: string;
    reference: string;
  };
  [MessagesTemplates.DELIVERED]: {
    reference: string;
  };
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
      const {
        dashboardLink,
        fullName,
        orderNumber,
        deliveryArea,
        contactNumber,
      } = params as MessagesParamsMap[MessagesTemplates.RIDER_ASSIGNED];
      return messages.riderAssigned(
        fullName,
        orderNumber,
        deliveryArea,
        contactNumber,
        dashboardLink,
      );
    }
    if (template === MessagesTemplates.RIDER_REASSIGNED) {
      const { fullName, reference } =
        params as MessagesParamsMap[MessagesTemplates.RIDER_REASSIGNED];
      return messages.riderReassigned(fullName, reference);
    }
    if (template === MessagesTemplates.NEW_ORDER_RECEIVED) {
      return messages.newOrderReceived();
    }
    if (template === MessagesTemplates.RIDER_ACCOUNT_CREATED) {
      const { fullName } =
        params as MessagesParamsMap[MessagesTemplates.RIDER_ACCOUNT_CREATED];
      return messages.riderAccountCreated(fullName);
    }
    if (template === MessagesTemplates.SHIPMENT_RECEIVED_RECEIVER) {
      const { reference, trackLink } =
        params as MessagesParamsMap[MessagesTemplates.SHIPMENT_RECEIVED_RECEIVER];
      return messages.shipmentReceivedReceiver(reference, trackLink);
    }

    if (template === MessagesTemplates.OUT_FOR_DELIVERY) {
      const { trackingLink, code, reference } =
        params as MessagesParamsMap[MessagesTemplates.OUT_FOR_DELIVERY];
      return messages.outForDelivery(reference, trackingLink, code);
    }
    if (template === MessagesTemplates.DELIVERED) {
      const { reference } =
        params as MessagesParamsMap[MessagesTemplates.DELIVERED];
      return messages.delivered(reference);
    }
    return '';
  }
}
