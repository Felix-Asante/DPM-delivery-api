import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateVariableDto } from './create-variable.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVariableDto extends PartialType(CreateVariableDto) {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  label: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  value: string;
}
