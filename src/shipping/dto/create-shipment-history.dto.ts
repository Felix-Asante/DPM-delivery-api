import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ShipmentHistoryStatus } from 'src/utils/enums';

export class CreateShipmentHistoryDto {
  @IsEnum(ShipmentHistoryStatus)
  @ApiProperty()
  status: ShipmentHistoryStatus;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.status === ShipmentHistoryStatus.FAILED_DELIVERY_ATTEMPT)
  @ApiPropertyOptional()
  description: string;

  @IsString()
  @Optional()
  @ApiPropertyOptional()
  confirmationCode?: string;

  @ApiPropertyOptional({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  photo?: Express.Multer.File;
}
