import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { FilesService } from 'src/files/files.service';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { ComplaintCategory } from 'src/utils/enums';
import { isValidDateString } from 'src/utils/helpers';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { FindAllComplaintsDto } from './dto/find-all-complaints.dto';
import { Complaint } from './entities/complaint.entity';

const PICTURE_REQUIRED_CATEGORIES: ComplaintCategory[] = [
  ComplaintCategory.DAMAGED_ITEM,
  ComplaintCategory.ITEM_SWAP,
];

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintsRepository: Repository<Complaint>,
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
    private readonly filesService: FilesService,
  ) {}

  async create(body: CreateComplaintDto, picture?: Express.Multer.File) {
    const order = await this.shippingOrderRepository.findOne({
      where: { reference: body.trackingNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found for tracking number');
    }

    if (PICTURE_REQUIRED_CATEGORIES.includes(body.category) && !picture) {
      throw new BadRequestException(
        'Picture is required for this complaint category',
      );
    }

    let uploadedPictureUrl: string | null = null;
    if (picture) {
      const upload = await this.filesService.uploadImage(picture);
      uploadedPictureUrl = upload?.secure_url;
    }

    const complaint = this.complaintsRepository.create({
      fullName: body.fullName,
      phone: body.phone,
      trackingNumber: body.trackingNumber,
      category: body.category,
      issue: body.issue,
      picture: uploadedPictureUrl,
      order,
    });

    return this.complaintsRepository.save(complaint);
  }

  findAllForAdmin(dto: FindAllComplaintsDto) {
    const { page = 1, limit = 10, query, category, from, to } = dto;
    const rest = { page, limit };

    if ((from && !to) || (to && !from)) {
      throw new BadRequestException('Invalid date range');
    }
    if (from && to) {
      if (!isValidDateString(from) || !isValidDateString(to)) {
        throw new BadRequestException('Invalid date range');
      }
    }

    const base: FindOptionsWhere<Complaint> = {};
    if (category) {
      base.category = category;
    }
    if (from && to) {
      base.createdAt = Between(new Date(from), new Date(to));
    }

    if (query) {
      const q = ILike(`%${query}%`);
      const orWhere: FindOptionsWhere<Complaint>[] = [
        { ...base, fullName: q },
        { ...base, phone: q },
        { ...base, trackingNumber: q },
        { ...base, issue: q },
      ];
      return paginate(this.complaintsRepository, rest, {
        where: orWhere,
        order: { createdAt: 'DESC' },
      });
    }

    return paginate(this.complaintsRepository, rest, {
      where: Object.keys(base).length ? base : undefined,
      order: { createdAt: 'DESC' },
    });
  }
}
