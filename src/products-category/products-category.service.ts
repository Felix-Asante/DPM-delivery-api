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

@Injectable()
export class ProductsCategoryService {
  constructor(
    @InjectRepository(ProductsCategory)
    private readonly productsCategoryRepository: Repository<ProductsCategory>,
  ) {}

  async create(createProductsCategoryDto: CreateProductsCategoryDto) {
    try {
      const category = await this.productsCategoryRepository.findOneBy({
        name: createProductsCategoryDto.name,
      });
      if (category) {
        throw new BadRequestException(ERRORS.CATEGORIES.ALREADY_EXIST);
      }

      const newCategory = this.productsCategoryRepository.create({
        name: createProductsCategoryDto.name,
        place: createProductsCategoryDto.place,
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
