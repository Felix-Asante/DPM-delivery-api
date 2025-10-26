import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { WalletTransactionTypes } from 'src/utils/enums';

export class GetTransactionsDto extends PaginationOptions {
  @ApiPropertyOptional({ enum: Object.values(WalletTransactionTypes) })
  @IsOptional()
  @IsEnum(WalletTransactionTypes)
  type?: WalletTransactionTypes;
}
