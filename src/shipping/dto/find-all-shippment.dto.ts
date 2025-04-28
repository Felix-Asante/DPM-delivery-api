import { PaginationOptions } from 'src/entities/pagination.entity';
import { IsEnum, IsOptional } from 'class-validator';
import { ShipmentHistoryStatus } from 'src/utils/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllShipmentDto extends PaginationOptions {
  @IsEnum(ShipmentHistoryStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ShipmentHistoryStatus,
    description: 'Status of the shipment',
  })
  status?: ShipmentHistoryStatus;
}
