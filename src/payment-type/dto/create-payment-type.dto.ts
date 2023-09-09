import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentTypeDto {
  @ApiProperty()
  @IsString()
  name: string;
}
