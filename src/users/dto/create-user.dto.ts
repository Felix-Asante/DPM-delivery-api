import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  fullName: string;
  @ApiProperty()
  @IsString()
  phone: string;
  @ApiProperty()
  @IsString()
  password: string;
}
