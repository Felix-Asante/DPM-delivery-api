import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

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
  @IsDecimal()
  averagePrice: number;
  @ApiProperty()
  placeAdmin: CreateUserDto;
}
