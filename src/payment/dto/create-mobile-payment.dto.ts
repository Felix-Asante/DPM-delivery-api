import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateMobilePaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  customerName: string;

  @IsString()
  @ApiProperty()
  provider: string;

  @IsString()
  @ApiProperty()
  reference: string;

  @ApiProperty()
  @IsString()
  customerMobile: string;

  @ApiProperty()
  @IsString()
  transactionId: string;

  @ApiProperty()
  @IsString()
  requestId: string;
}
