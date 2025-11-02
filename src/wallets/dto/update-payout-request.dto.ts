import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PayoutRequestStatus } from 'src/utils/enums';

export class UpdatePayoutRequestStatusDto {
  @ApiPropertyOptional({
    description: 'New status for the payout request',
    enum: PayoutRequestStatus,
  })
  @IsEnum(PayoutRequestStatus)
  @IsNotEmpty()
  status: PayoutRequestStatus;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required when rejecting)',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Failure reason (required when marking as failed)',
  })
  @IsOptional()
  @IsString()
  failureReason?: string;

  @ApiPropertyOptional({
    description: 'Internal notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'External reference from payment provider',
  })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({
    description: 'Transaction ID from payment provider',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
