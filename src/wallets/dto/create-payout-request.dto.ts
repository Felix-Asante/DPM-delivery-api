import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { PayoutMethod } from 'src/utils/enums';

export class CreatePayoutRequestDto {
  @ApiProperty({
    description: 'Amount to withdraw',
    example: 100.0,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Payout method',
    enum: PayoutMethod,
    example: PayoutMethod.MOBILE_MONEY,
  })
  @IsEnum(PayoutMethod)
  @IsNotEmpty()
  payoutMethod: PayoutMethod;

  // Mobile Money fields
  @ApiPropertyOptional({
    description: 'Mobile money provider (required for mobile money)',
    example: 'MTN',
  })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.MOBILE_MONEY)
  @IsString()
  @IsNotEmpty()
  mobileMoneyProvider?: string;

  @ApiPropertyOptional({
    description: 'Mobile money number (required for mobile money)',
    example: '0241234567',
  })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.MOBILE_MONEY)
  @IsString()
  @IsNotEmpty()
  mobileMoneyNumber?: string;

  @ApiPropertyOptional({
    description: 'Mobile money account holder name (required for mobile money)',
    example: 'John Doe',
  })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.MOBILE_MONEY)
  @IsString()
  @IsNotEmpty()
  mobileMoneyAccountName?: string;

  // Bank Transfer fields
  @ApiPropertyOptional({
    description: 'Bank account number (required for bank transfer)',
    example: '1234567890',
  })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.BANK_TRANSFER)
  @IsString()
  @IsNotEmpty()
  accountNumber?: string;

  @ApiPropertyOptional({
    description: 'Bank account name (required for bank transfer)',
    example: 'John Doe',
  })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.BANK_TRANSFER)
  @IsString()
  @IsNotEmpty()
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Bank name (required for bank transfer)',
    example: 'Standard Bank',
  })
  @ValidateIf((o) => o.payoutMethod === PayoutMethod.BANK_TRANSFER)
  @IsString()
  @IsNotEmpty()
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Bank code (optional)',
    example: '001',
  })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
