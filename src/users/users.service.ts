import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { ERRORS } from 'src/utils/errors';
import { Role } from './entities/role.entity';
import { CodeUseCases, UserRoles } from 'src/utils/enums';
import { generateExpiryDate, generateOtpCode } from 'src/utils/helpers';
import { MessagesService } from 'src/messages/messages.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly messageService: MessagesService,
    private readonly jwtService: JwtService,
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
    newUser.role = role;
    newUser.fullName = createUserDto.fullName;
    newUser.phone = createUserDto.phone;
    newUser.codeExpiryDate = generateExpiryDate();
    newUser.code = smsCode;
    newUser.codeUseCase = CodeUseCases.ACTIVATE_ACCOUNT;
    newUser.password = createUserDto.password;

    const savedUser = await newUser.save();
    // send sms
    const SMS_MESSAGE = `Your account verification code is ${smsCode}`;
    await this.messageService.sendSmsMessage({
      message: SMS_MESSAGE,
      recipient: createUserDto.phone,
    });

    const tokenPayload = {
      phone: savedUser.phone,
      fullName: savedUser.fullName,
      id: savedUser.id,
    };

    return {
      user: { ...savedUser.toJSON() },
      accessToken: this.jwtService.sign(tokenPayload),
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
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
      const user = await this.userRepository.findOne({ where: { phone } });
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
      const user = await this.userRepository.findOne({ where: { code } });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
