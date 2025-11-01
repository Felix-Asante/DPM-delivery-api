import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ShipmentHistoryStatus } from 'src/utils/enums';
import { Type } from 'class-transformer';

export class CreateShipmentHistoryDto {
  @IsEnum(ShipmentHistoryStatus)
  @ApiProperty()
  status: ShipmentHistoryStatus;

  @IsString()
  @Optional()
  @ValidateIf((o) => o.status === ShipmentHistoryStatus.FAILED_DELIVERY_ATTEMPT)
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @Optional()
  @ApiPropertyOptional()
  confirmationCode?: string;

  @ApiPropertyOptional({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  photo?: Express.Multer.File;

  @IsString()
  @Optional()
  @ApiPropertyOptional()
  isPaid?: string;
}
