import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/CreateProductDto.dto';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
import { ERRORS } from 'src/utils/errors';
import { FilesService } from 'src/files/files.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { extractIdFromImage } from 'src/utils/helpers';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    @InjectRepository(ProductsCategory)
    private readonly productsCategoryRepository: Repository<ProductsCategory>,
    private fileService: FilesService,
  ) {}

  async create(body: CreateProductDto, photo: Express.Multer.File) {
    const { name, description, productCategory } = body;
    try {
      const newProduct = new Products();
      const category = await this.productsCategoryRepository.findOneBy({
        id: productCategory,
      });

      if (!category) {
        throw new NotFoundException(ERRORS.CATEGORIES.NOT_FOUND);
      }

      newProduct.name = name;
      if (description) {
        newProduct.description = description;
      }
      if (photo) {
        const savedPhoto = await this.fileService.uploadImage(photo);
        newProduct.photo = savedPhoto.url;
      }
      newProduct.productCategory = category;
      return await newProduct.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateProduct(
    { description, name, productCategory }: UpdateProductDto,
    photo: Express.Multer.File,
    id: string,
  ) {
    try {
      const product = await this.findProductById(id);
      if (name) {
        product.name = name;
      }
      if (description) {
        product.description = description;
      }
      if (productCategory) {
        const category = await this.productsCategoryRepository.findOneBy({
          id: productCategory,
        });

        if (!category) {
          throw new NotFoundException(ERRORS.CATEGORIES.NOT_FOUND);
        }
        product.productCategory = category;
      }
      if (photo && product.photo) {
        const imageId = extractIdFromImage(product.photo);
        this.fileService.deleteImage(imageId);
        const savedImage = await this.fileService.uploadImage(photo);
        product.photo = savedImage.url;
      } else if (photo) {
        const savedImage = await this.fileService.uploadImage(photo);
        product.photo = savedImage.url;
      }

      return await product.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findProductById(id: string) {
    try {
      const product = await this.productRepository.findOneBy({ id });
      if (!product) {
        throw new NotFoundException(ERRORS.PRODUCTS.NOT_FOUND.EN);
      }

      return product;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      await this.findProductById(id);
      const result = await this.productRepository.delete({ id });
      if (result.affected) {
        return {
          success: true,
          message: 'product successfully deleted',
        };
      } else {
        return {
          success: false,
          message: 'Failed to delete product',
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
