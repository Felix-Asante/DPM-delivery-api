import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVariableDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  label: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  value: string;
}
