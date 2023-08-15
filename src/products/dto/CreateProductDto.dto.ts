import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Can be ingredients,services', required: false })
  @IsString()
  description: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  photo: Express.Multer.File;
  @ApiProperty()
  @IsString()
  productCategory: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsDecimal()
  price: number;
}
