import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePaymentmethodDto {
  @ApiProperty()
  @IsString()
  name: string;
  @IsString()
  @ApiPropertyOptional()
  code: string;
  @ApiProperty()
  @IsString()
  paymentMethodType: string;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image: Express.Multer.File;
}
