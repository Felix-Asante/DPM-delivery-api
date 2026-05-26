import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { complaintStatusEnum } from 'src/utils/enums';

export class UpdateComplaintStatusDto {
  @IsEnum(complaintStatusEnum)
  @ApiProperty({ enum: complaintStatusEnum })
  status: complaintStatusEnum;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    required: false,
    description: 'Optional comment about the status update',
  })
  comment?: string;
}
