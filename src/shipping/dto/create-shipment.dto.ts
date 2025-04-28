import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AllowedCities,
  ModeOfShipment,
  ShipmentOptions,
} from 'src/utils/enums';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  pickupArea: string;

  @IsEnum(AllowedCities)
  @ApiProperty({ enum: AllowedCities })
  @IsNotEmpty()
  pickupCity: AllowedCities;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dropOffArea: string;

  @IsEnum(AllowedCities)
  @ApiProperty({ enum: AllowedCities })
  @IsNotEmpty()
  dropOffCity: AllowedCities;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  senderPhone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  recipientPhone: string;

  @IsEnum(ShipmentOptions)
  @IsNotEmpty()
  @ApiProperty({ enum: ShipmentOptions })
  shipmentOption: ShipmentOptions;

  @IsEnum(ModeOfShipment)
  @IsNotEmpty()
  @ApiProperty({ enum: ModeOfShipment })
  modeOfShipment: ModeOfShipment;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  extraInformation?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Date)
  pickupDate?: Date;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Date)
  dropOffDate?: Date;
}
