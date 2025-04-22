import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ShipmentHistoryStatus } from 'src/utils/enums';

export class CreateShipmentHistoryDto {
  @IsEnum(ShipmentHistoryStatus)
  @ApiProperty()
  status: ShipmentHistoryStatus;

  @IsString()
  @Optional()
  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  photo?: Express.Multer.File;
}
