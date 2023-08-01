import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { ERRORS } from 'src/utils/errors';
import {
  generateExpiryDate,
  generateOtpCode,
  isCodeExpired,
} from 'src/utils/helpers';
import { VerifyCodeDto } from './dto/verifyCode.dto';
import { CodeUseCases } from 'src/utils/enums';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from 'src/messages/messages.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly messageService: MessagesService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(body: LoginDto) {
    try {
      const user = await this.usersService.findUserByPhone(body.phone);
      const passwordValid = await bcrypt.compare(body.password, user.password);
      if (user && !passwordValid) {
        throw new BadRequestException(ERRORS.INVALID_PASSWORD.EN);
      }
      const tokenPayload = {
        phone: user.phone,
        fullName: user.fullName,
        id: user.id,
      };
      return {
        user: { ...user.toJSON() },
        accessToken: this.jwtService.sign(tokenPayload),
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async requestPasswordResetCode(phone: string) {
    try {
      const user = await this.usersService.findUserByPhone(phone);
      if (user) {
        const smsCode = generateOtpCode();
        user.codeExpiryDate = generateExpiryDate();
        user.code = smsCode;
        user.codeUseCase = CodeUseCases.RESET_PASSWORD;

        // send sms
        const SMS_MESSAGE = `Your reset password confirmation code is ${smsCode}`;
        await this.messageService.sendSmsMessage({
          message: SMS_MESSAGE,
          recipient: phone,
        });
        user.save();
        return {
          success: true,
          code: smsCode,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordDto, resetCode: string) {
    try {
      const user = await this.usersService.findUserByCode(resetCode);
      if (!user) throw new NotFoundException(ERRORS.INVALID_CODE.EN);

      if (isCodeExpired(user.codeExpiryDate)) {
        throw new BadRequestException(ERRORS.CODE_EXPIRED.EN);
      }
      if (data.confirmPassword !== data.newPassword) {
        throw new BadRequestException(ERRORS.PASSWORD_MISMATCH.EN);
      }

      if (await bcrypt.compare(data.newPassword, user.password)) {
        throw new BadRequestException(ERRORS.PASSWORD_ALREADY_IN_USE.EN);
      }
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      user.password = hashedPassword;
      user.code = null;
      user.codeExpiryDate = null;
      user.codeUseCase = null;
      user.save();

      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyAccount(code: string) {
    const { user } = await this.verifyCode({
      code,
      useCase: CodeUseCases.ACTIVATE_ACCOUNT,
    });
    if (user) {
      user.isVerified = true;
      user.codeExpiryDate = null;
      user.code = null;
      user.codeUseCase = null;
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
