import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @ApiProperty()
  place: string;

  @IsArray()
  @ApiPropertyOptional()
  services: {
    product: string;
    quantity: number;
    price: number;
    place: string;
  }[];

  @IsInt()
  @ApiPropertyOptional()
  quantity: number;

  @IsInt()
  @ApiPropertyOptional()
  delivery_fee: number;

  @IsInt()
  @ApiPropertyOptional()
  price: number;

  @IsInt()
  @ApiPropertyOptional()
  rider_tip: number;

  @IsString()
  @ApiProperty()
  delivery_address: string;

  @IsPhoneNumber('GH')
  @ApiProperty()
  recipient_phone: string;

  @IsString()
  @ApiProperty()
  transaction_id: string;

  @IsInt()
  @ApiPropertyOptional()
  total_amount: number;
}
