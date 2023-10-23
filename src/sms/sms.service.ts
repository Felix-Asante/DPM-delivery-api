import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ARKESEL_ENDPOINTS } from 'src/utils/constants';

const http = axios.create({
  baseURL: process.env.ARKESEL_ENDPOINT_V2,
  headers: {
    'api-key': process.env.ARKESEL_KEY,
  },
});
@Injectable()
export class SmsService {
  async send(recipients: string[], message: string) {
    const body = {
      sender: 'DPM DELIVERY',
      message,
      recipients,
    };
    try {
      const response = await http.post(ARKESEL_ENDPOINTS.SEND_SM, body);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
