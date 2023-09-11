import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentmethodDto } from './dto/create-paymentmethod.dto';
import { UpdatePaymentmethodDto } from './dto/update-paymentmethod.dto';
import { Repository } from 'typeorm';
import { PaymentMethods } from './entities/paymentmethod.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { extractIdFromImage, tryCatch } from 'src/utils/helpers';
import { FilesService } from 'src/files/files.service';
import { PaymentTypeService } from 'src/payment-type/payment-type.service';
import { ERRORS } from 'src/utils/errors';
import { PaymentMethodTypes } from 'src/utils/enums';

@Injectable()
export class PaymentmethodService {
  constructor(
    @InjectRepository(PaymentMethods)
    private readonly paymentMethodRepository: Repository<PaymentMethods>,
    private readonly fileService: FilesService,
    private readonly paymentTypeService: PaymentTypeService,
  ) {}
  create(
    { name, paymentMethodType, code }: CreatePaymentmethodDto,
    image: Express.Multer.File,
  ) {
    return tryCatch(async () => {
      const paymentMethod = await this.findPaymentMethodByName(name);
      if (paymentMethod) {
        throw new ConflictException(
          'A Payment method with this name already exist',
        );
      }

      const newPaymentMethod = new PaymentMethods();
      newPaymentMethod.name = name;

      const type = await this.paymentTypeService.findTypeById(
        paymentMethodType,
      );

      if (!type) {
        throw new BadRequestException(ERRORS.PAYMENT_TYPE.DOES_NOT_EXIST.EN);
      }

      if (type.name === PaymentMethodTypes.MOBILE_MONEY) {
        if (!code) {
          throw new BadRequestException(ERRORS.PAYMENT_METHOD.ADD.EN);
        }
        newPaymentMethod.short_code = code;
      }
      newPaymentMethod.type = type;

      if (image) {
        const savedImage = await this.fileService.uploadImage(image);
        newPaymentMethod.image = savedImage.secure_url;
      }

      return await newPaymentMethod.save();
    });
  }

  findAll(type?: string) {
    return tryCatch(async () => {
      console.log('first', type);
      if (type) {
        const methods = await this.paymentMethodRepository.find({
          where: { type: { name: type } },
        });
        return methods;
      }
      const paymentMethods = await this.paymentMethodRepository.find();
      return paymentMethods;
    });
  }

  findPaymentMethodById(id: string) {
    return tryCatch<PaymentMethods>(async () => {
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { id },
      });
      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }
      return paymentMethod;
    });
  }
  findPaymentMethodByName(name: string) {
    return tryCatch<PaymentMethods>(async () => {
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { name },
      });
      return paymentMethod;
    });
  }

  update(
    id: string,
    { name, paymentMethodType, code }: UpdatePaymentmethodDto,
    image: Express.Multer.File,
  ) {
    return tryCatch<PaymentMethods>(async () => {
      const paymentMethod = await this.findPaymentMethodById(id);

      if (name && name !== paymentMethod.name) {
        const paymentMethod = await this.findPaymentMethodByName(name);
        if (paymentMethod) {
          throw new ConflictException(
            'A Payment method with this name already exist',
          );
        }
        paymentMethod.name = name;
      }
      if (paymentMethodType && paymentMethod.type.id !== paymentMethodType) {
        const type = await this.paymentTypeService.findTypeById(
          paymentMethodType,
        );
        if (!type) {
          throw new BadRequestException(ERRORS.PAYMENT_TYPE.DOES_NOT_EXIST.EN);
        }

        paymentMethod.type = type;
      }
      if (code && code !== paymentMethod.short_code) {
        paymentMethod.short_code = code;
      }
      if (image) {
        if (paymentMethod.image) {
          const imageId = extractIdFromImage(paymentMethod.image);
          await this.fileService.deleteImage(imageId);
        }

        const savedImage = await this.fileService.uploadImage(image);
        paymentMethod.image = savedImage.secure_url;
      }
      return await paymentMethod.save();
    });
  }

  remove(id: string) {
    return tryCatch(async () => {
      await this.findPaymentMethodById(id);

      const result = await this.paymentMethodRepository.delete({ id });

      if (!result.affected) {
        throw new BadRequestException('Failed to delete payment method');
      }
      return { success: true };
    });
  }
}
