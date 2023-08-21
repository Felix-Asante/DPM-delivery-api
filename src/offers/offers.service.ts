import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferTypes } from './entities/offer-type.entity';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { IDistance } from 'src/utils/interface';
import { getNearbyPlaces } from 'src/utils/helpers';
import { OfferTypeDto } from './dtos/create-offer-types.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferTypes)
    private readonly offerTypesRepository: Repository<OfferTypes>,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
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

  async filterNearbyOffers(offers: Offer[], position: IDistance) {
    const places = offers.map((offer) => offer.place);
    const nearbyPlaces = getNearbyPlaces(places, position);

    const nearbyOffers = offers.filter((offer) =>
      nearbyPlaces.includes(offer.place),
    );

    return nearbyOffers;
  }
}
