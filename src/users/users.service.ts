import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { paginate } from 'nestjs-typeorm-paginate';
import { BookingStatus } from 'src/bookings/entities/booking-status.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { LikesService } from 'src/likes/likes.service';
import { MessagesService } from 'src/messages/messages.service';
import { BookingState, CodeUseCases, UserRoles } from 'src/utils/enums';
import { ERRORS } from 'src/utils/errors';
import {
  generateExpiryDate,
  generateOtpCode,
  getTotalItems,
  tryCatch,
} from 'src/utils/helpers';
import { IFindUserQuery } from 'src/utils/interface';
import { authRules } from 'src/utils/rules';
import { ILike, Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { FilesService } from 'src/files/files.service';

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
    private readonly filesService: FilesService,
  ) {}
  async create(createUserDto: CreateUserDto, isPlaceAdmin = false) {
    const user = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
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
    } else {
      newUser.isVerified = true;
    }
    newUser.role = role;
    newUser.fullName = createUserDto.fullName;
    newUser.phone = createUserDto.phone;
    newUser.password = createUserDto.password;

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
        where: {
          user: { id },
          status: { id: bookingStatus.id },
        },
        order: { createdAt: 'DESC' },
      });
    });
  }
  findAll(searchQuery: IFindUserQuery) {
    return tryCatch(async () => {
      const {
        role = UserRoles.USER,
        query,
        page = 1,
        limit = 10,
      } = searchQuery;
      let searchWhereClause = [];
      if (role && !query) {
        searchWhereClause = [{ role: { name: role } }];
      }
      if (query && !role) {
        searchWhereClause = [
          { fullName: ILike(`%${query}%`) },
          { email: ILike(`%${query}%`) },
        ];
      }
      if (query && role) {
        searchWhereClause = [
          { fullName: ILike(`%${query}%`), role: { name: role } },
          { email: ILike(`%${query}%`), role: { name: role } },
        ];
      }

      const users = paginate(
        this.userRepository,
        { page, limit },
        { where: searchWhereClause, relations: ['role'] },
      );

      return users;
    });
  }

  getTotalUsers(user: User) {
    return tryCatch(
      async () =>
        await getTotalItems({
          user,
          repository: this.userRepository,
          where: { role: { name: ILike(`%${UserRoles.USER}%`) } },
        }),
    );
  }
  async findLikes(id: string) {
    return await this.likeService.getLikesByUser(id);
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role', 'wallet', 'rider'],
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
        relations: ['role', 'wallet', 'rider'],
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

  async findById(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role', 'wallet', 'rider'],
      });
      if (!user) {
        throw new NotFoundException(ERRORS.USER_NOT_FOUND.EN);
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
        relations: ['role', 'wallet', 'rider'],
      });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  update(
    id: string,
    updateUserDto: UpdateUserDto,
    profilePicture: Express.Multer.File,
    requestUser: User,
  ) {
    return tryCatch(async () => {
      const user = await this.findById(id);

      if (requestUser.id !== id && requestUser.role.name !== UserRoles.ADMIN) {
        throw new UnauthorizedException(ERRORS.UNAUTHORIZED.EN);
      }

      const { fullName, email, address } = updateUserDto;
      const updatedUser = user;
      if (profilePicture) {
        const results = await this.filesService.uploadImage(profilePicture);
        updatedUser.profilePicture = results.url;
      }

      updatedUser.fullName = fullName || user.fullName;
      updatedUser.email = email || user.email;
      updatedUser.address = address || user.address;

      const savedUser = await updatedUser.save();
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

  async findPlaceAdmin(placeId: string) {
    return tryCatch(async () => {
      const user = await this.userRepository.findOne({
        where: { adminFor: { id: placeId } },
      });
      if (!user) {
        return new NotFoundException(ERRORS.PLACES.NOT_FOUND);
      }
      delete user.adminFor;
      return user;
    });
  }

  remove(id: string) {
    return tryCatch(async () => {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role', 'wallet'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const results = await this.userRepository.delete(id);
      if (!results.affected) {
        return { success: false };
      }
      return { success: true };
    });
  }

  async findRiderById(id: string) {
    const rider = await this.userRepository.findOne({
      where: { id, role: { name: UserRoles.COURIER } },
      relations: ['role', 'wallet'],
    });
    if (!rider) {
      throw new NotFoundException('Rider not found');
    }
    return rider;
  }
}
