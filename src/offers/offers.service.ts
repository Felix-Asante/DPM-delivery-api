import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferTypes } from './entities/offer-type.entity';
import { Offer } from './entities/offer.entity';
import { ILike, Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { IDistance } from 'src/utils/interface';
import { getNearbyPlaces, tryCatch } from 'src/utils/helpers';
import { OfferTypeDto } from './dtos/create-offer-types.dto';
import { CreateOfferDto } from './dtos/create-offer.dto';
import { ProductsService } from 'src/products/products.service';
import { PlacesService } from 'src/places/places.service';
import { Place } from 'src/places/entities/place.entity';
import { OffersTypes } from 'src/utils/enums';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import { UpdateOfferDto } from './dtos/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferTypes)
    private readonly offerTypesRepository: Repository<OfferTypes>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly productService: ProductsService,
    private readonly placeService: PlacesService,
  ) {}

  async createOffersType(body: OfferTypeDto) {
    try {
      const type = this.offerTypesRepository.create({ name: body.name });
      return type.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateOfferType(id: string, data: OfferTypeDto) {
    try {
      const type = await this.getOfferTypeById(id);
      type.name = data.name;
      return type.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOffersType() {
    try {
      const types = await this.offerTypesRepository.find();
      return types;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOfferTypeById(id: string) {
    try {
      const type = await this.offerTypesRepository.findOneBy({ id });
      if (!type) {
        throw new NotFoundException(ERRORS.OFFERS.TYPE_NOT_FOUND.EN);
      }
      return type;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getOfferTypeByName(name: string) {
    try {
      const type = await this.offerTypesRepository.findOneBy({ name });
      if (!type) {
        throw new NotFoundException(ERRORS.OFFERS.TYPE_NOT_FOUND.EN);
      }
      return type;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOffersByType(type: string, position?: IDistance) {
    try {
      await this.getOfferTypeById(type);

      const offers = await this.offerRepository
        .createQueryBuilder('offer')
        .leftJoinAndSelect('offer.place', 'place')
        .where('offer.type = :type', { type })
        .getMany();

      if (position?.latitude && position?.longitude) {
        const nearbyOffers = await this.filterNearbyOffers(offers, position);
        return nearbyOffers;
      }

      return offers;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async deleteOfferType(typeId: string) {
    try {
      await this.getOfferTypeById(typeId);
      const results = await this.offerTypesRepository.delete({ id: typeId });
      if (results.affected) {
        return {
          success: true,
          message: 'offer type deleted successfully',
        };
      } else {
        return {
          success: true,
          message: 'Failed to delete offer type',
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // !OFFERS
  async createOffer(body: CreateOfferDto) {
    try {
      const newOffer = new Offer();
      const {
        placeId,
        price,
        productId,
        reductionPercent,
        start_date,
        end_date,
        offerType,
        description,
        title,
      } = body;
      newOffer.price = price;
      newOffer.reductionPercent = reductionPercent;
      newOffer.start_date = start_date;
      newOffer.end_date = end_date;
      newOffer.description = description;
      newOffer.title = title;
      const type = await this.getOfferTypeById(offerType);
      newOffer.type = type;
      if (type.name === OffersTypes.PLACE_OFFER && !placeId) {
        throw new BadRequestException(ERRORS.PLACES.NOT_EMPTY);
      }
      if (type.name === OffersTypes.PRODUCT_OFFER && !productId) {
        throw new BadRequestException(ERRORS.PRODUCTS.NOT_EMPTY.EN);
      }
      if (placeId) {
        const place = (await this.placeService.findPlaceById(placeId)) as Place;
        if (place) {
          newOffer.place = place;
        }
      } else if (productId && !placeId) {
        const product = await this.productService.findProductById(productId);
        newOffer.product = product;
      }
      return await newOffer.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateOffer(offerId: string, body: UpdateOfferDto) {
    return tryCatch(async () => {
      const { placeId, productId, offerType, ...updatedData } = body;
      const offer = await this.getOfferById(offerId);

      const updatedOffer = await this.offerRepository.preload({
        id: offerId,
        ...updatedData,
      });

      if (offerType !== offer?.type?.id) {
        const type = await this.getOfferTypeById(offerType);
        updatedOffer.type = type;
        if (type.name === OffersTypes.PLACE_OFFER && !placeId) {
          throw new BadRequestException(ERRORS.PLACES.NOT_EMPTY);
        }
        if (type.name === OffersTypes.PRODUCT_OFFER && !productId) {
          throw new BadRequestException(ERRORS.PRODUCTS.NOT_EMPTY.EN);
        }
      }
      if (placeId && placeId !== offer.place.id) {
        const place = (await this.placeService.findPlaceById(
          body?.placeId,
        )) as Place;
        if (place) {
          updatedOffer.place = place;
        }
      }

      if (productId && productId !== offer?.product.id) {
        const product = await this.productService.findProductById(
          body?.productId,
        );
        updatedOffer.product = product;
      }

      const newOffer = await updatedOffer.save();
      return newOffer;
    });
  }

  async getAllOffers(paginationOptions: PaginationOptions) {
    try {
      const { page = 1, limit = 10, query } = paginationOptions;

      const whereClause = query
        ? [
            { title: ILike(`%${query}%`) },
            { place: { name: ILike(`%${query}%`) } },
            { product: { name: ILike(`%${query}%`) } },
          ]
        : {};
      const offers = await paginate(
        this.offerRepository,
        { page, limit },
        {
          relations: ['place', 'product'],
          where: whereClause,
        },
      );

      return offers;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getOfferById(id: string) {
    try {
      const offer = await this.offerRepository.findOneBy({ id });
      if (!offer) {
        throw new NotFoundException(ERRORS.OFFERS.NOT_FOUND);
      }
      return offer;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPlaceOffers() {
    try {
      const type = await this.getOfferTypeByName(OffersTypes.PLACE_OFFER);
      const offers = await this.offerRepository.find({
        where: { type: { id: type.id } },
        relations: ['place'],
      });
      return offers.filter(
        (offer) => !this.hasOfferExpired(new Date(offer.end_date)),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getProductOffers() {
    try {
      const type = await this.getOfferTypeByName(OffersTypes.PRODUCT_OFFER);
      const offers = await this.offerRepository.find({
        where: { type: { id: type.id } },
        relations: ['product'],
      });
      return offers.filter(
        (offer) => !this.hasOfferExpired(new Date(offer.end_date)),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteOffer(id: string) {
    try {
      await this.getOfferById(id);
      const results = await this.offerRepository.delete({ id });
      console.log(results);
      if (results.affected) {
        return {
          success: true,
        };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  hasOfferExpired = (expiryDate: Date) => {
    const expirationDate = new Date(expiryDate);
    const currentDate = new Date();
    return expirationDate.getTime() <= currentDate.getTime();
  };

  async filterNearbyOffers(offers: Offer[], position: IDistance) {
    const places = offers.map((offer) => offer.place);
    const nearbyPlaces = getNearbyPlaces(places, position);

    const nearbyOffers = offers.filter((offer) =>
      nearbyPlaces.includes(offer.place),
    );

    return nearbyOffers;
  }
}
