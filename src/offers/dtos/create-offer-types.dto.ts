import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class OfferTypeDto {
  @ApiProperty()
  @IsString()
  name: string;
}
