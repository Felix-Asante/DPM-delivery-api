import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { ComplaintCategory } from 'src/utils/enums';

export class FindAllComplaintsDto extends PaginationOptions {
  @IsOptional()
  @IsEnum(ComplaintCategory)
  @ApiPropertyOptional({ enum: ComplaintCategory })
  category?: ComplaintCategory;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ISO start date (inclusive)' })
  from?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'ISO end date (inclusive)' })
  to?: string;
}
