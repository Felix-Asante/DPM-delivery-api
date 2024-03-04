import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class RatePlaceDto {
  @IsString()
  @ApiProperty()
  comment: string;

  @IsNumber()
  @Max(5)
  @Min(1)
  @ApiProperty()
  rating: number;
}
