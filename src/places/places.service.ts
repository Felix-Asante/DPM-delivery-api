import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { ILike, Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { FilesService } from 'src/files/files.service';
import { ProductsCategoryService } from 'src/products-category/products-category.service';
import { Categories, UserRoles } from 'src/utils/enums';
import { UsersService } from 'src/users/users.service';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { User } from 'src/users/entities/user.entity';
import { isDecimal, toDecimal } from 'geolib';
import { IDistance, Like } from 'src/utils/interface';
import { extractIdFromImage, getNearbyPlaces } from 'src/utils/helpers';
import { LikesService } from 'src/likes/likes.service';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,

    private readonly categoriesService: CategoriesService,
    private readonly filesService: FilesService,
    private readonly productCategoryService: ProductsCategoryService,
    private readonly usersService: UsersService,
    private readonly likesService: LikesService,
  ) {}

  async createPlace(
    place: CreatePlaceDto,
    mainImage: Express.Multer.File,
    logo: Express.Multer.File,
  ) {
    try {
      const newPlace = new Place();
      const category = await this.categoriesService.findCategoryById(
        place.category,
      );
      if (logo) {
        const uploadedLogo = await this.filesService.uploadImage(logo);
        newPlace.logo = uploadedLogo.url;
      }
      const uploadedImage = await this.filesService.uploadImage(mainImage);
      newPlace.mainImage = uploadedImage.url;
      newPlace.name = place.name;
      newPlace.email = place.email;
      newPlace.phone = place.phone;
      newPlace.address = place.address;
      newPlace.minPrepTime = place.minPrepTime;
      newPlace.maxPrepTime = place.maxPrepTime;
      newPlace.latitude = isDecimal(place.latitude)
        ? place.latitude
        : toDecimal(place.latitude);
      newPlace.longitude = isDecimal(place.longitude)
        ? place.longitude
        : toDecimal(place.longitude);
      newPlace.website = place?.website;
      newPlace.averagePrice = place?.averagePrice;
      newPlace.category = category;
      if (place.deliveryFee) {
        newPlace.deliveryFee = place.deliveryFee;
      }

      const savedUser = await this.usersService.create(place.placeAdmin, true);
      const result = await newPlace.save();

      await this.productCategoryService.create({
        name: Categories.UNCATEGORIZED,
        place: result?.id,
      });

      savedUser.adminFor = result;
      await savedUser.save();
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updatePlace(
    {
      category: categoryId,
      logo: placeLogo,
      mainImage: placeImg,
      averagePrice,
      ...body
    }: UpdatePlaceDto,
    user: User,
    id: string,
    mainImage: Express.Multer.File,
    logo?: Express.Multer.File,
  ) {
    try {
      if (
        !(
          user.role.name === UserRoles.ADMIN ||
          (user.role.name === UserRoles.PLACE_ADMIN && id === user.adminFor.id)
        )
      ) {
        throw new ForbiddenException();
      }

      const place = await this.placeRepository.preload({ id, ...body });

      if (categoryId) {
        const category = await this.categoriesService.findCategoryById(
          categoryId,
        );
        place.category = category;
      }
      if (averagePrice) {
        place.averagePrice = averagePrice;
      }
      if (logo) {
        const imagePublicId = extractIdFromImage(place?.logo);
        await this.filesService.deleteImage(imagePublicId);
        const savedImage = await this.filesService.uploadImage(logo);
        place.logo = savedImage.url;
      }
      if (mainImage) {
        const imagePublicId = extractIdFromImage(place?.mainImage);
        await this.filesService.deleteImage(imagePublicId);
        const savedImage = await this.filesService.uploadImage(logo);
        place.mainImage = savedImage.url;
      }
      return place;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findPlacesNearBy(distance: IDistance) {
    try {
      const places = await this.placeRepository.find();
      const nearestPlaces = getNearbyPlaces(places, distance);
      return nearestPlaces;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

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

  async getNewPlaces(coords?: IDistance) {
    try {
      const places = await this.placeRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
      if (coords?.latitude && coords?.longitude) {
        return getNearbyPlaces(places, coords).slice(0, 11);
      }
      return places.slice(0, 11);
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

  async getPlaceProducts(placeId: string) {
    try {
      const result = await this.productCategoryService.getPlaceProducts(
        placeId,
      );
      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findPlaceById(id: string, visit = true) {
    try {
      const place = await this.placeRepository.findOneBy({ id });
      if (!place) {
        throw new NotFoundException(ERRORS.PLACES.NOT_FOUND);
      }
      if (visit) {
        const visits = place.visits;
        place.visits = visits + 1;
      }
      return await place.save();
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
      const visits = place.visits;
      place.visits = visits + 1;
      await place.save();
      return place;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPopularPlaces(coords?: IDistance) {
    try {
      const popularPlaces = await this.placeRepository.find({
        order: {
          visits: 'DESC',
        },
        relations: ['category'],
      });

      if (coords?.latitude && coords?.longitude) {
        return getNearbyPlaces(popularPlaces, coords).slice(0, 11);
      }
      return popularPlaces.slice(0, 11);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async searchPlace(query: string, category?: string, coords?: IDistance) {
    try {
      let searchWhereClause;
      if (!query.length && !category?.length) return [];
      if (category) {
        searchWhereClause = [
          {
            name: ILike(`%${query}%`),
            category: { name: ILike(`%${category}%`) },
          },
          {
            website: ILike(`%${query}%`),
            category: { name: ILike(`%${category}%`) },
          },
          {
            address: ILike(`%${query}%`),
            category: { name: ILike(`%${category}%`) },
          },
          {
            name: ILike(`%${query}%`),
            category: { name: ILike(`%${category}%`) },
          },
          {
            name: ILike(`%${query}%`),
            category: { name: ILike(`%${category}%`) },
          },
        ];
      } else {
        searchWhereClause = [
          { name: ILike(`%${query}%`) },
          { website: ILike(`%${query}%`) },
          { address: ILike(`%${query}%`) },
          { name: ILike(`%${query}%`) },
          { name: ILike(`%${query}%`) },
        ];
      }

      const results = await this.placeRepository.find({
        where: searchWhereClause,
        relations: ['category'],
      });

      if (coords?.latitude && coords?.longitude) {
        return getNearbyPlaces(results, coords);
      }
      return results;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async LikePlace(data: Like) {
    return await this.likesService.createLike(data);
  }
  async UnLikePlace(data: Like) {
    return await this.likesService.unLike(data);
  }
}
