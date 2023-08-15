import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdatePlaceDto {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  name: string;
  @IsOptional()
  @ApiPropertyOptional()
  @IsEmail()
  email: string;
  @IsOptional()
  @ApiPropertyOptional()
  @IsPhoneNumber('GH')
  phone: string;
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  address: string;
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  longitude: string;
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  latitude: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website: string;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  logo: Express.Multer.File;
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  mainImage: Express.Multer.File;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsDecimal()
  averagePrice: number;
  @ApiProperty({ required: false })
  @IsString()
  category: string;
}
