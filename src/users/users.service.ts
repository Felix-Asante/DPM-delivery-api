import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikesService } from 'src/likes/likes.service';
import { MessagesService } from 'src/messages/messages.service';
import { BookingState, CodeUseCases, UserRoles } from 'src/utils/enums';
import { ERRORS } from 'src/utils/errors';
import {
  generateExpiryDate,
  generateOtpCode,
  tryCatch,
} from 'src/utils/helpers';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { BookingStatus } from 'src/bookings/entities/booking-status.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { authRules } from 'src/utils/rules';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly messageService: MessagesService,
    private readonly likeService: LikesService,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingStatus)
    private readonly bookingStatusRepository: Repository<BookingStatus>,
  ) {}
  async create(createUserDto: CreateUserDto, isPlaceAdmin = false) {
    console.log(createUserDto)
    const user = await this.userRepository.findOne({
      where: { phone: "0554436269" },
    });
    if (user) {
      throw new ConflictException(ERRORS.PHONE_ALREADY_TAKEN.EN);
    }

    // create a new user
    const role = await this.roleRepository.findOne({
      where: { name: isPlaceAdmin ? UserRoles.PLACE_ADMIN : UserRoles.USER },
    });
    const newUser = new User();
    const smsCode = generateOtpCode();
    if (!isPlaceAdmin) {
      newUser.codeExpiryDate = generateExpiryDate();
      newUser.code = smsCode;
      newUser.codeUseCase = CodeUseCases.ACTIVATE_ACCOUNT;
    }
    newUser.role = role;
    newUser.fullName = 'Ashigbogbo';
    newUser.phone = `0554436269`;
    newUser.password = 'dpm';

    const savedUser = await newUser.save();
    // send sms
    const SMS_MESSAGE = `Your Account Verification code is ${smsCode}`;
    if (!isPlaceAdmin) {
      await this.messageService.sendSmsMessage({
        message: SMS_MESSAGE,
        recipient: [createUserDto.phone],
      });
    }

    return savedUser;
  }

  findUserBookings(status: string = BookingState.CONFIRMED, { id }: User) {
    return tryCatch(async () => {
      const bookingStatus = await this.bookingStatusRepository.findOne({
        where: { label: status },
      });
      if (!bookingStatus) {
        throw new BadRequestException('Invalid booking status');
      }
      return await this.bookingRepository.find({
        where: { user: { id }, status: { id: bookingStatus.id } },
      });
    });
  }
  findAll() {
    return tryCatch(async () => {
      const users = await this.userRepository.find({
        where: { role: { name: UserRoles.USER } },
      });

      return users;
    });
  }

  async findLikes(id: string) {
    return await this.likeService.getLikesByUser(id);
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException(ERRORS.USER_NOT_FOUND_EMAIL.EN);
      }
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findUserByPhone(phone: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { phone },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException(ERRORS.USER_NOT_FOUND_PHONE.EN);
      }
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findUserByCode(code: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { code },
        relations: ['role'],
      });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  update({ phone }: User, updateUserDto: UpdateUserDto) {
    return tryCatch(async () => {
      const user = await this.findUserByPhone(phone);

      const { fullName, email: newEmail } = updateUserDto;
      if (fullName.length && user.fullName !== fullName) {
        user.fullName = fullName;
      }
      if (user.email !== newEmail && newEmail.length) {
        user.email = newEmail;
      }
      const savedUser = await user.save();
      return savedUser;
    });
  }

  changePassword({ phone }: User, body: ChangePasswordDto) {
    return tryCatch(async () => {
      const user = await this.findUserByPhone(phone);
      const passwordValid = await bcrypt.compare(body.password, user.password);
      if (!passwordValid) {
        throw new BadRequestException(ERRORS.INVALID_PASSWORD.EN);
      }

      if (!authRules.password.test(body.newPassword)) {
        throw new BadRequestException(ERRORS.INVALID_PASSWORD_PATTERN.EN);
      }
      if (body.confirmPassword !== body.newPassword) {
        throw new BadRequestException(ERRORS.PASSWORD_MISMATCH.EN);
      }

      if (await bcrypt.compare(body.newPassword, user.password)) {
        throw new BadRequestException(ERRORS.PASSWORD_ALREADY_IN_USE.EN);
      }
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      console.log(hashedPassword, body.newPassword);
      user.password = hashedPassword;

      await user.save();

      return 'Password successfully changed';
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
