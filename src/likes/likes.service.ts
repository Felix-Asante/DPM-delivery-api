import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Place } from 'src/places/entities/place.entity';
import { Like } from 'src/utils/interface';
import { Repository } from 'typeorm';
import { Likes } from './entities/likes.entity';
import { ERRORS } from 'src/utils/errors';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    @InjectRepository(Likes)
    private readonly likeRepository: Repository<Likes>,
  ) {}

  async createLike(data: Like) {
    try {
      const newLike = new Likes();
      const place = await this.placeRepository.findOneBy({ id: data.place });
      const liked = await this.likeRepository.findOneBy({
        user: { id: data.user.id },
      });

      if (liked) throw new BadRequestException(ERRORS.LIKES.LIKED);
      if (!place) throw new NotFoundException(ERRORS.PLACES.NOT_FOUND);

      const user = data.user;
      newLike.place = place;
      newLike.user = user;

      user.likes = [...user.likes, data.place];

      await user.save();

      return await newLike.save();
    } catch (error) {
      throw error;
    }
  }

  async unLike(data: Like) {
    try {
      const liked = await this.likeRepository.findOne({
        where: { place: { id: data.place }, user: { id: data.user.id } },
      });

      const user = data?.user;

      if (!liked) throw new BadRequestException(ERRORS.LIKES.NOT_LIKED);

      const result = await this.likeRepository.delete({
        place: { id: data.place },
        user: { id: data.user.id },
      });

      if (result.affected) {
        user.likes = user.likes?.filter((likes) => likes !== data.place);

        await user.save();

        return {
          success: true,
          message: ERRORS.LIKES.DELETED,
        };
      } else {
        return {
          success: false,
          message: ERRORS.LIKES.FAILED,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getLikesByUser(userId: string) {
    try {
      const likes = await this.likeRepository.find({
        where: { user: { id: userId } },
        relations: ['place'],
      });
      return likes;
    } catch (error) {
      throw error;
    }
  }
}
