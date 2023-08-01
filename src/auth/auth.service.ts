import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { ERRORS } from 'src/utils/errors';
import { generateOtpCode, isCodeExpired } from 'src/utils/helpers';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { CodeUseCases } from 'src/utils/enums';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  login(body: LoginDto) {
    return `Login ${JSON.stringify(body)}`;
  }
  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async verifyAccount(code: string) {
    const { user } = await this.verifyCode({
      code,
      useCase: CodeUseCases.ACTIVATE_ACCOUNT,
    });
    if (user) {
      user.isVerified = true;
      return await user.save();
    }
  }

  async verifyCode(payload: VerifyCodeDto) {
    try {
      const user = await this.usersService.findUserByCode(payload.code);
      if (!user) {
        throw new NotFoundException(ERRORS.INVALID_CODE.EN);
      }
      // check if code matches use case & verify expiration time
      if (payload.useCase !== user.codeUseCase) {
        throw new BadRequestException(ERRORS.CODE_USECASE_MISMATCH.EN);
      }
      if (isCodeExpired(user.codeExpiryDate)) {
        throw new BadRequestException(ERRORS.CODE_EXPIRED.EN);
      }

      return { success: true, user };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
