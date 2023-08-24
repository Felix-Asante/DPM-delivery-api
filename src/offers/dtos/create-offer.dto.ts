import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty()
  @IsNumber()
  reductionPercent: number;
  @ApiProperty()
  @IsNumber()
  price: number;
  @ApiProperty()
  @IsDateString()
  start_date: string;
  @ApiProperty()
  @IsDateString()
  end_date: string;
  @ApiProperty()
  @IsString()
  offerType: string;
  @ApiPropertyOptional()
  @IsString()
  productId: string;
  @ApiPropertyOptional()
  @IsString()
  placeId: string;
}
