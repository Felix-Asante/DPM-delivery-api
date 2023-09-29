import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @ApiProperty()
  place: string[];

  @IsString()
  @ApiPropertyOptional()
  services: {
    product: string;
    quantity: number;
    price: number;
    place: string;
  }[];

  @IsNumber()
  @ApiPropertyOptional()
  quantity: number;

  @IsInt()
  @ApiPropertyOptional()
  price: number;

  @IsInt()
  @ApiPropertyOptional()
  rider_tip: number;

  @IsString()
  @ApiProperty()
  delivery_address: string;

  @IsString()
  @ApiProperty()
  recipient_phone: string;

  @IsString()
  @ApiProperty()
  transaction_id: string;

  @IsInt()
  @ApiPropertyOptional()
  total_amount: number;
}
