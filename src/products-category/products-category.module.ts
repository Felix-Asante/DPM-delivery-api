import { Module } from '@nestjs/common';
import { ProductsCategoryService } from './products-category.service';
import { ProductsCategoryController } from './products-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsCategory } from './entities/products-category.entity';
import { Role } from 'src/users/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from 'src/messages/messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsCategory, Role, User])],
  controllers: [ProductsCategoryController],
  providers: [ProductsCategoryService, UsersService, MessagesService],
})
export class ProductsCategoryModule {}
