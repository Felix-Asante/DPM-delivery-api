import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsPhoneNumber('GH')
  phone: string;
}
export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  newPassword: string;
  @ApiProperty()
  @IsString()
  confirmPassword: string;
}
