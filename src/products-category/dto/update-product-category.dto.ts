import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateProductsCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;
}
