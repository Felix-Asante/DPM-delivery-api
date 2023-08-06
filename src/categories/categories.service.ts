import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { ERRORS } from 'src/utils/errors';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly fileService: FilesService,
  ) {}

  async createCategory(data: CreateCategoryDto, picture: Express.Multer.File) {
    try {
      const uploadedFile = await this.fileService.uploadImage(picture);
      const category = this.categoryRepository.create({
        name: data.name,
        image: uploadedFile.url,
      });
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

  async deleteCategory(id: string) {
    try {
      await this.findCategoryById(id);
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
