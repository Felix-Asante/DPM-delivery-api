import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilesService } from 'src/files/files.service';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { ComplaintCategory } from 'src/utils/enums';
import { Repository } from 'typeorm';
import { CreateComplaintDto } from './dto/create-complaint.dto';
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
}
