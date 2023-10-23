import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ARKESEL_ENDPOINTS } from 'src/utils/constants';

@Injectable()
export class SmsService {
  http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: process.env.ARKESEL_ENDPOINT_V2,
      headers: {
        'api-key': process.env.ARKESEL_KEY,
      },
    });
  }

  async send(recipients: string[], message: string) {
    const body = {
      sender: 'DPM BRAND',
      message,
      recipients,
    };
    try {
      const response = await this.http.post(ARKESEL_ENDPOINTS.SEND_SM, body);
      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
