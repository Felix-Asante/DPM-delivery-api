import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ModeOfShipment, ShipmentOptions } from 'src/utils/enums';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  pickupAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  dropOffAddress: string;

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
