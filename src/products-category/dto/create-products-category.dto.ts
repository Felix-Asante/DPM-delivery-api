import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Place } from 'src/places/entities/place.entity';

export class CreateProductsCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  place: Place;
}
