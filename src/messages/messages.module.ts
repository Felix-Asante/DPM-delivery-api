import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { SmsService } from 'src/sms/sms.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, SmsService],
  exports: [MessagesService],
})
export class MessagesModule {}
