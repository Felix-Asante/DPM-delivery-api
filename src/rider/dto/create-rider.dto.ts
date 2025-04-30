import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNumber, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class CreateRiderDto extends CreateUserDto {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  bikeRegistrationNumber: string;

  @IsString()
  @ApiProperty()
  bikeType: string;

  @IsString()
  @ApiProperty()
  bikeColor: string;

  @IsString()
  @ApiProperty()
  bikeBrand: string;

  @IsString()
  @ApiProperty()
  bikeModel: string;

  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  bikeYear: number;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  bikeImage: Express.Multer.File;

  @IsString()
  @ApiProperty()
  identificationDocumentNumber: string;

  @IsString()
  @ApiProperty()
  identificationDocumentType: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  identificationDocumentImage: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profilePicture: Express.Multer.File;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  documentExpiryDate: Date;
}
