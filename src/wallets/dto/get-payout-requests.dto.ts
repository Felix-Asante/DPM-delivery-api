import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { PayoutRequestStatus, PayoutMethod } from 'src/utils/enums';

export class GetPayoutRequestsDto extends PaginationOptions {
  @ApiPropertyOptional({
    enum: PayoutRequestStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(PayoutRequestStatus)
  status?: PayoutRequestStatus;

  @ApiPropertyOptional({
    enum: PayoutMethod,
    description: 'Filter by payout method',
  })
  @IsOptional()
  @IsEnum(PayoutMethod)
  payoutMethod?: PayoutMethod;

  @ApiPropertyOptional({
    description: 'Filter by rider ID',
  })
  @IsOptional()
  @IsString()
  riderId?: string;

  @ApiPropertyOptional({
    description: 'Filter by reference',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (ISO format)',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (ISO format)',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;
}
