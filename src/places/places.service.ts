import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  async getAllPlaces() {
    try {
      const places = await this.placeRepository.find();
      return places;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getPlacesByCategory(slug: string) {
    try {
      const places = await this.placeRepository.find({
        where: { category: { slug: slug } },
      });
      return places;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deletePlace(id: string) {
    try {
      await this.findPlaceById(id);
      const deletePlace = await this.placeRepository.delete({ id });
      if (deletePlace.affected) {
        return {
          success: true,
          message: 'Place deleted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to delete the place',
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findPlaceById(id: string) {
    try {
      const place = await this.placeRepository.findOneBy({ id });
      if (!place) {
        return new NotFoundException(ERRORS.PLACES.NOT_FOUND);
      }
      return place;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findPlaceBySlug(slug: string) {
    try {
      const place = await this.placeRepository.findOneBy({ slug });
      if (!place) {
        return new NotFoundException(ERRORS.PLACES.NOT_FOUND);
      }
      return place;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
