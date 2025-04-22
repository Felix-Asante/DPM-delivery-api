import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @IsPhoneNumber('GH')
  phone: string;
  @ApiProperty()
  @IsString()
  address: string;
  @ApiProperty()
  @IsString()
  longitude: string;
  @ApiProperty()
  @IsString()
  latitude: string;
  @ApiProperty()
  @IsOptional()
  @IsString()
  website: string;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  logo: Express.Multer.File;
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  mainImage: Express.Multer.File;
  @ApiProperty()
  @IsString()
  category: string;
  @ApiProperty()
  @IsDecimal({ force_decimal: false })
  averagePrice: string;
  @ApiProperty()
  @ApiPropertyOptional()
  @IsOptional()
  @IsDecimal({ force_decimal: false })
  deliveryFee: string;
  @ApiProperty()
  @ApiPropertyOptional()
  @IsDecimal({ force_decimal: false })
  @IsOptional()
  minPrepTime: string;
  @ApiPropertyOptional()
  @ApiProperty()
  @IsDecimal({ force_decimal: false })
  @IsOptional()
  maxPrepTime: string;
  @ApiProperty()
  @IsString()
  placeAdminFullName: string;
  @ApiProperty()
  @IsString()
  placeAdminPhone: string;
  @ApiProperty()
  @IsString()
  placeAdminPassword: string;
}
