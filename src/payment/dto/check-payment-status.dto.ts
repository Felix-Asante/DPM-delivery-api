import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckPaymentStatusDto {
  @ApiProperty()
  @IsString()
  requestId: string;

  @ApiProperty()
  @IsString()
  transactionId: string;
}
