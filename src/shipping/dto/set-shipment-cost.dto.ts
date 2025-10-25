import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SetShipmentCostDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({}, { message: 'pickupFee must be a valid number' })
  @Type(() => Number)
  pickupFee: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({}, { message: 'riderCommission must be a valid number' })
  @Max(100, { message: 'riderCommission must not exceed 100' })
  @Type(() => Number)
  riderCommission: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({}, { message: 'deliveryFee must be a valid number' })
  @Type(() => Number)
  deliveryFee: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'repackagingFee must be a valid number' })
  @Type(() => Number)
  repackagingFee?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  paid: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAt?: Date;
}
