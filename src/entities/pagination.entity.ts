import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';

export class PaginationOptions {
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @ApiPropertyOptional()
  page = 1;

  @Min(1)
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @ApiPropertyOptional()
  limit = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  query?: string;
}
