import { IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  code: string;
  @IsString()
  useCase: string;
}
