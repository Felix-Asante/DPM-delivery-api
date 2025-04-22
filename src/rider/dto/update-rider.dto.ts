import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRiderDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  bikeRegistrationNumber?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  bikeType?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  bikeColor?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  bikeBrand?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  bikeModel?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Number)
  bikeYear?: number;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  bikeImage?: Express.Multer.File;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  identificationDocumentNumber?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  identificationDocumentType?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', required: true })
  @IsOptional()
  identificationDocumentImage?: Express.Multer.File;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Date)
  documentExpiryDate?: Date;
}
