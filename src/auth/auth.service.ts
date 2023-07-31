import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { ERRORS } from 'src/utils/errors';
import { generateOtpCode } from 'src/utils/helpers';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  login(body: LoginDto) {
    return `Login ${JSON.stringify(body)}`;
  }
  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  sendSMSCode = async ({ phone }: { phone: string }) => {
    try {
      const user = await this.usersService.findUserByPhone(phone);
      if (!user) {
        throw new NotFoundException(ERRORS.USER_NOT_FOUND_EMAIL.EN);
      }

      // if (
      //   user.requestedPhoneConfirmationAt &&
      //   user.requestedPhoneConfirmationAt.getTime() +
      //     TIME_TO_REQUEST_NEW_CODE * 60 * 1000 >
      //     new Date().getTime()
      // ) {
      //   throw new BadRequestException({
      //     statusCode: 400,
      //     message: ERRORS.ALREADY_REQUESTED_CODE.EN,
      //     error: 'Bad Request',
      //     secondsLeft: Math.ceil(
      //       (user.requestedPasswordResetAt.getTime() +
      //         TIME_TO_REQUEST_NEW_CODE * 60 * 1000 -
      //         Date.now()) /
      //         1000,
      //     ),
      //   });
      // }
      // user.resetCode = generateOtpCode();
      // user.requestedPasswordResetAt = new Date();
      await user.save();
      // await this.emailsService.sendEmail(
      //   user.email,
      //   EmailService.EmailTemplates.FORGOT_PASSWORD,
      //   EmailService.Languages.fr,
      //   {
      //     code: user.resetCode,
      //     name: user.fullName,
      //   },
      // );
      return {
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}
