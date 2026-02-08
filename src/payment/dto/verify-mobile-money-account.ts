import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { MobileMoneyProvider } from 'src/utils/enums';

export class VerifyMobileMoneyAccountDto {
  @ApiProperty()
  @IsPhoneNumber('GH')
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsEnum(MobileMoneyProvider)
  @IsNotEmpty()
  provider: MobileMoneyProvider;
}
