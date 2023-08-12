import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { CreatePlaceDto } from './dto/create-place.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { FilesService } from 'src/files/files.service';
import { ProductsCategoryService } from 'src/products-category/products-category.service';
import { Categories, UserRoles } from 'src/utils/enums';
import { UsersService } from 'src/users/users.service';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import getPreciseDistance from 'geolib/es/getPreciseDistance';
import { convertDistance, isDecimal, toDecimal } from 'geolib';
import { MAX_DELIVERY_DISTANCE } from 'src/utils/constants';
import { IDistance } from 'src/utils/interface';
@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly categoriesService: CategoriesService,
    private readonly filesService: FilesService,
    private readonly productCategoryService: ProductsCategoryService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
      newPlace.latitude = isDecimal(place.latitude)
        ? place.latitude
        : toDecimal(place.latitude);
      newPlace.longitude = isDecimal(place.longitude)
        ? place.longitude
        : toDecimal(place.longitude);
      newPlace.website = place?.website;
      newPlace.category = category;

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
      if (logo) {
        const imagePublicId = this.extractIdFromImage(place?.logo);
        await this.filesService.deleteImage(imagePublicId);
        const savedImage = await this.filesService.uploadImage(logo);
        place.logo = savedImage.url;
      }
      if (mainImage) {
        const imagePublicId = this.extractIdFromImage(place?.mainImage);
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
      const nearestPlaces = this.getNearbyPlaces(places, distance);
      return nearestPlaces;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  extractIdFromImage(image: string): string {
    const imagePublicId = image?.split('/')?.at(-1).split('.')?.[0];
    return imagePublicId;
  }

  getNearbyPlaces(places: Place[], distance: IDistance) {
    return places.filter((place) => {
      const d = getPreciseDistance(
        distance,
        {
          latitude: place.latitude,
          longitude: place.longitude,
        },
        0.01,
      );

      const distanceKm = convertDistance(d, 'km');

      if (distanceKm <= MAX_DELIVERY_DISTANCE) return true;
    });
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
      const visits = place.visits;
      place.visits = visits + 1;
      await place.save();
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
      });

      if (coords?.latitude && coords?.longitude) {
        return this.getNearbyPlaces(popularPlaces, coords).slice(0, 11);
      }
      return popularPlaces.slice(0, 11);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
