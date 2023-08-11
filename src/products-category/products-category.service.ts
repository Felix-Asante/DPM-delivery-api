import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { ProductsCategory } from './entities/products-category.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { User } from 'src/users/entities/user.entity';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class ProductsCategoryService {
  constructor(
    @InjectRepository(ProductsCategory)
    private readonly productsCategoryRepository: Repository<ProductsCategory>,
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  async create(createProductsCategoryDto: CreateProductsCategoryDto) {
    try {
      const result = await this.productsCategoryRepository.findOne({
        where: {
          place: { id: createProductsCategoryDto.place },
          name: createProductsCategoryDto.name,
        },
      });
      if (result) {
        throw new BadRequestException(ERRORS.CATEGORIES.ALREADY_EXIST);
      }

      const place = await this.placeRepository.findOne({
        where: { id: createProductsCategoryDto.place },
      });
      if (!place) {
        throw new NotFoundException(ERRORS.PLACES.NOT_FOUND);
      }
      const newCategory = this.productsCategoryRepository.create({
        name: createProductsCategoryDto.name,
        place: place,
      });
      return await newCategory.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateCategory(name: string, categoryId: string) {
    try {
      const category = await this.findCategoryById(categoryId);
      if (!name) throw new BadRequestException(`Category can not be empty`);
      category.name = name;
      return await category.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllProductsCategory() {
    try {
      return await this.productsCategoryRepository.find();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteCategory(id: string) {
    try {
      await this.findCategoryById(id);
      const deleted = await this.productsCategoryRepository.delete(id);
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
      const category = await this.productsCategoryRepository.findOne({
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
      const category = await this.productsCategoryRepository.findOne({
        where: { id },
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
}
