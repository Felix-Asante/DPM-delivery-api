import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/users/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRoles } from 'src/utils/enums';
import { ERRORS } from 'src/utils/errors';
import { generateOtpCode, tryCatch } from 'src/utils/helpers';
import { Repository } from 'typeorm';
import { CreateRiderDto } from './dto/create-rider.dto';
import { Rider } from './entities/rider.entity';
import { FilesService } from 'src/files/files.service';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { UpdateRiderDto } from './dto/update-rider.dto';

@Injectable()
export class RiderService {
  constructor(
    @InjectRepository(Rider)
    private readonly riderRepository: Repository<Rider>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly filesService: FilesService,
  ) {}

  async create(
    createRiderDto: CreateRiderDto,
    bikeImageFile: Express.Multer.File,
    identificationDocumentImageFile: Express.Multer.File,
  ) {
    const { email, phone, password, fullName, ...riderData } = createRiderDto;

    let user = await this.userRepository.findOne({
      where: { phone },
    });

    if (user) {
      throw new ConflictException(ERRORS.PHONE_ALREADY_TAKEN.EN);
    }

    user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new ConflictException(ERRORS.EMAIL_ALREADY_TAKEN.EN);
    }

    const role = await this.roleRepository.findOne({
      where: { name: UserRoles.COURIER },
    });

    if (!role) {
      throw new InternalServerErrorException();
    }

    const newUser = this.userRepository.create({
      email,
      phone,
      password,
      fullName,
      isVerified: true,
    });

    newUser.role = role;
    let bikeImage, identificationDocumentImage;

    if (bikeImageFile) {
      const bikeImageResult = await this.filesService.uploadImage(
        bikeImageFile,
      );
      bikeImage = bikeImageResult.url;
    }

    if (identificationDocumentImageFile) {
      const identificationDocumentImageResult =
        await this.filesService.uploadImage(identificationDocumentImageFile);
      identificationDocumentImage = identificationDocumentImageResult.url;
    }

    const newRider = new Rider();

    newRider.bikeRegistrationNumber = riderData.bikeRegistrationNumber;
    newRider.bikeType = riderData.bikeType;
    newRider.bikeColor = riderData.bikeColor;
    newRider.bikeBrand = riderData.bikeBrand;
    newRider.bikeModel = riderData.bikeModel;
    newRider.bikeYear = riderData.bikeYear;
    newRider.identificationDocumentNumber =
      riderData.identificationDocumentNumber;
    newRider.identificationDocumentType = riderData.identificationDocumentType;
    newRider.documentExpiryDate = riderData.documentExpiryDate;
    newRider.riderId = `DPM-RIDER-${generateOtpCode(8)}`;
    newRider.bikeImage = bikeImage;
    newRider.identificationDocumentImage = identificationDocumentImage;

    const savedRider = await this.riderRepository.save(newRider);
    newUser.rider = savedRider;
    return await this.userRepository.save(newUser);
  }

  async update(
    id: string,
    updateRiderDto: UpdateRiderDto,
    files: {
      bikeImage: Express.Multer.File[];
      identificationDocumentImage: Express.Multer.File[];
    },
  ) {
    return tryCatch(async () => {
      const rider = await this.riderRepository.findOne({
        where: { id: id },
      });

      if (!rider) {
        throw new NotFoundException(ERRORS.RIDER.NOT_FOUND.EN);
      }
      const { ...rest } = updateRiderDto;
      const { bikeImage, identificationDocumentImage } = files;

      let bikeImageResult = rider.bikeImage,
        identificationDocumentImageResult = rider.identificationDocumentImage;

      if (bikeImage && bikeImage.length > 0) {
        const result = await this.filesService.uploadImage(bikeImage[0]);
        bikeImageResult = result.url;
      }
      if (
        identificationDocumentImage &&
        identificationDocumentImage.length > 0
      ) {
        const result = await this.filesService.uploadImage(
          identificationDocumentImage[0],
        );
        identificationDocumentImageResult = result.url;
      }

      await this.riderRepository.update(id, {
        ...rest,
        bikeImage: bikeImageResult,
        identificationDocumentImage: identificationDocumentImageResult,
      });

      return { success: true };
    });
  }

  async findAll(options: PaginationOptions) {
    const { page, limit } = options;
    return await paginate(
      this.userRepository,
      { page, limit },
      {
        relations: ['rider'],
        where: { role: { name: UserRoles.COURIER } },
        order: {
          createdAt: 'DESC',
        },
      },
    );
  }

  async findOneById(id: string) {
    return await this.userRepository.findOne({
      where: {
        id,
        role: { name: UserRoles.COURIER },
      },
      relations: ['rider'],
    });
  }
}
