import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRoles } from 'src/utils/enums';
import { ERRORS } from 'src/utils/errors';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  findReviewById = async (id: string) => {
    try {
      const review = await this.reviewsRepository.findOneBy({
        id,
      });
      if (!review) {
        throw new NotFoundException(ERRORS.REVIEWS.NOT_FOUND.EN);
      }
      return review;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  removeReview = async (id: string, user: User) => {
    try {
      const review = await this.findReviewById(id);

      if (user.role.name === UserRoles.USER && review.user.id != user.id) {
        throw new BadRequestException(ERRORS.REVIEWS.NOT_YOURS.EN);
      }
      const placeRatingCount = await this.reviewsRepository.countBy({
        booking: {
          place: {
            id: review.booking.place.id,
          },
        },
      });

      review.booking.place.rating =
        placeRatingCount == 1
          ? null
          : (placeRatingCount * review.booking.place.rating - review.rating) /
            (placeRatingCount - 1);
      await review.booking.place.save();
      const deleted = await this.reviewsRepository.delete(id);
      if (deleted.affected) {
        return {
          success: true,
          message: `The review with id: ${id} has been deleted`,
        };
      } else {
        return {
          success: false,
          message: `The review with id: ${id} has NOT been deleted`,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
