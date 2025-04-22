import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @ApiPropertyOptional()
  @Optional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @Optional()
  email?: string;

  @ApiPropertyOptional()
  @Optional()
  @IsString()
  address?: string;
}
