import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilesService } from 'src/files/files.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PlacesService } from 'src/places/places.service';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly fileService: FilesService,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  async createCategory(data: CreateCategoryDto, picture: Express.Multer.File) {
    try {
      const uploadedFile = await this.fileService.uploadImage(picture);
      const category = this.categoryRepository.create({
        name: data.name,
        image: uploadedFile.url,
        imgId: uploadedFile.public_id,
      });
      return (await category.save()).toJSON();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateCategory(
    data: UpdateCategoryDto,
    categoryId: string,
    picture?: Express.Multer.File,
  ) {
    try {
      const category = await this.findCategoryById(categoryId);
      if (category && picture) {
        await this.fileService.deleteImage(category.imgId);
        const uploadedImg = await this.fileService.uploadImage(picture);
        category.imgId = uploadedImg.public_id;
        category.image = uploadedImg.url;
      }
      if (data?.name) {
        category.name = data.name;
      }

      return await category.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getCategoryPlaces(slug: string) {
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

  async deleteCategory(id: string) {
    try {
      const category = await this.findCategoryById(id);
      await this.fileService.deleteImage(category.imgId);
      const deleted = await this.categoryRepository.delete(id);
      if (deleted.affected) {
        return {
          success: true,
          message: 'Category deleted successfully',
        };
      } else {
        return {
          success: true,
          message: 'Failed to delete category',
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findCategoryBySlug(slug: string) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { slug },
      });
      if (!category) {
        throw new NotFoundException(ERRORS.CATEGORIES.NOT_FOUND);
      }
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async findCategoryById(id: string) {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(ERRORS.CATEGORIES.NOT_FOUND);
      }
      return category;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
