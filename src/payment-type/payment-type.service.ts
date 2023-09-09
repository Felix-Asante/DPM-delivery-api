import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePaymentTypeDto } from './dto/create-payment-type.dto';
import { UpdatePaymentTypeDto } from './dto/update-payment-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentType } from './entities/payment-type.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';

@Injectable()
export class PaymentTypeService {
  constructor(
    @InjectRepository(PaymentType)
    private paymentTypeRepository: Repository<PaymentType>,
  ) {}
  async create({ name }: CreatePaymentTypeDto) {
    try {
      const type = await this.findTypeByName(name);
      if (type) throw new ConflictException(ERRORS.PAYMENT_TYPE.EXIST.EN);
      const newType = this.paymentTypeRepository.create({ name });
      return await newType.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findTypeByName(name: string) {
    try {
      const type = await this.paymentTypeRepository.findOne({
        where: { name },
      });
      return type;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findAll() {
    try {
      const paymentTypes = await this.paymentTypeRepository.find();
      return paymentTypes;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findTypeById(id: string) {
    try {
      const type = await this.paymentTypeRepository.findOne({ where: { id } });
      return type;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: string, { name }: UpdatePaymentTypeDto) {
    try {
      const paymentType = await this.findTypeById(id);
      if (!paymentType) {
        throw new BadRequestException(ERRORS.PAYMENT_TYPE.DOES_NOT_EXIST.EN);
      }
      paymentType.name = name;
      return await paymentType.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const paymentType = await this.findTypeById(id);
      if (!paymentType) {
        throw new BadRequestException(ERRORS.PAYMENT_TYPE.DOES_NOT_EXIST.EN);
      }
      const results = await this.paymentTypeRepository.delete({ id });
      if (!results.affected) {
        return { success: false };
      }
      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
