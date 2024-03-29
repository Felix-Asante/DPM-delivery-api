import {
  BadRequestException,
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
import {
  extractIdFromImage,
  getNearbyPlaces,
  getTotalItems,
  tryCatch,
} from 'src/utils/helpers';
import { LikesService } from 'src/likes/likes.service';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { RatePlaceDto } from 'src/reviews/dto/create-review.dto';
import { Booking } from 'src/bookings/entities/booking.entity';
import { UpdateOpeningHoursDto } from './dto/update-opening-hours.dto';
import { OpeningHours } from './entities/opening-hours.entity';

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
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(OpeningHours)
    private readonly openingHoursRepository: Repository<OpeningHours>,
  ) {}

  async createPlace(
    place: CreatePlaceDto,
    mainImage: Express.Multer.File,
    logo: Express.Multer.File,
  ) {
    try {
      const { placeAdminFullName, placeAdminPassword, placeAdminPhone } = place;
      const placeAdmin = {
        fullName: placeAdminFullName,
        password: placeAdminPassword,
        phone: placeAdminPhone,
      };
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
      newPlace.minPrepTime = +place.minPrepTime;
      newPlace.maxPrepTime = +place.maxPrepTime;
      newPlace.latitude = isDecimal(place.latitude)
        ? place.latitude
        : toDecimal(place.latitude);
      newPlace.longitude = isDecimal(place.longitude)
        ? place.longitude
        : toDecimal(place.longitude);
      newPlace.website = place?.website;
      newPlace.averagePrice = +place?.averagePrice;
      newPlace.category = category;
      if (place.deliveryFee) {
        newPlace.deliveryFee = +place.deliveryFee;
      }

      const savedUser = await this.usersService.create(placeAdmin, true);
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
        place.averagePrice = +averagePrice;
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

  async getAllPlaces(options: PaginationOptions & { category: string }) {
    const { query = '', category = '', ...paginationOptions } = options;
    try {
      // ADD FILTER BY CATEGORY AND SEARCH
      if (!query && !category) {
        const places = paginate<Place>(this.placeRepository, paginationOptions);
        return places;
      }
      let searchWhereClause;
      if (!query.length && !category?.length) return [];
      if (category) {
        searchWhereClause = [
          {
            name: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            website: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            address: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            name: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            name: ILike(`%${query}%`),
            category: { id: category },
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

      const results = paginate(this.placeRepository, paginationOptions, {
        where: searchWhereClause,
        relations: ['category'],
      });
      return results;
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

  async getPlaceAdmin(id: string) {
    return tryCatch(async () => {
      await this.findPlaceById(id);
      const admin = await this.usersService.findPlaceAdmin(id);
      return admin;
    });
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
            category: { id: category },
          },
          {
            website: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            address: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            name: ILike(`%${query}%`),
            category: { id: category },
          },
          {
            name: ILike(`%${query}%`),
            category: { id: category },
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

  async findTotalPlaces(user: User) {
    return tryCatch(
      async () =>
        await getTotalItems({ user, repository: this.placeRepository }),
    );
  }
  async ratePlace(user: User, { comment, rating }: RatePlaceDto, id: string) {
    try {
      const userBookings = await this.bookingRepository.find({
        where: {
          user: {
            id: user.id,
          },
          place: {
            id: id,
          },
        },
        order: {
          createdAt: 'DESC',
        },

        take: 1,
      });
      const userLastBooking = userBookings[0];
      if (!userLastBooking) {
        throw new BadRequestException(
          'You have nt yet ordered from this place',
        );
      }
      const bookingRating = await this.reviewsRepository.findOneBy({
        booking: {
          id: userLastBooking.id,
        },
      });
      if (bookingRating !== null) {
        await this.reviewsRepository.delete(bookingRating.id);
      }
      if (userLastBooking.place) {
        const placeRatingCount = await this.reviewsRepository.countBy({
          booking: {
            place: {
              id: userLastBooking.place.id,
            },
          },
        });
        userLastBooking.place.rating = userLastBooking.place.rating
          ? (userLastBooking.place.rating * placeRatingCount + rating) /
            (placeRatingCount + 1)
          : rating;
        userLastBooking.place.total_reviews = placeRatingCount + 1;
        await userLastBooking.place.save();
      }
      const review = new Review();
      review.user = user;
      review.booking = userLastBooking;
      review.comment = comment;
      review.rating = rating;
      review.date = new Date();
      await userLastBooking.save();
      return await review.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  findPlaceRatings = async (id: string, options: IPaginationOptions) => {
    try {
      await this.findPlaceById(id, false);
      const reviews = paginate(this.reviewsRepository, options, {
        where: {
          booking: {
            place: {
              id,
            },
          },
        },
        order: { createdAt: 'DESC' },
      });
      return reviews;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  updatePlaceOpeningHours = async (
    id: string,
    user: User,
    {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      exceptions,
    }: UpdateOpeningHoursDto,
  ) => {
    try {
      if (
        user.role.name === UserRoles.PLACE_ADMIN &&
        user.adminFor?.id !== id
      ) {
        throw new ForbiddenException(
          'You are not allowed to update this place',
        );
      }
      const place = await this.findPlaceById(id);
      if (place.openingHours) {
        const id = place.openingHours.id;
        place.openingHours = null;
        await place.save();
        await this.openingHoursRepository.delete(id);
      }
      const openingHours = new OpeningHours();
      openingHours.monday = monday;
      openingHours.tuesday = tuesday;
      openingHours.wednesday = wednesday;
      openingHours.thursday = thursday;
      openingHours.friday = friday;
      openingHours.saturday = saturday;
      openingHours.sunday = sunday;
      openingHours.exceptions = exceptions;
      const savedOpeningHours = await openingHours.save();
      place.openingHours = savedOpeningHours;
      await place.save();
      return savedOpeningHours;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
