import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class RatePlaceDto {
  @IsString()
  @ApiProperty()
  comment: string;

  @IsInt()
  @Max(5)
  @Min(1)
  @ApiProperty()
  rating: number;
}
