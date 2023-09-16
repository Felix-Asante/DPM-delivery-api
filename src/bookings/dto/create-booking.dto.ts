import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @ApiProperty()
  place: string;

  @IsString()
  @ApiPropertyOptional()
  product: string;

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
  @ApiProperty()
  quantity: number;

  @IsInt()
  @ApiProperty()
  amount: number;
}
