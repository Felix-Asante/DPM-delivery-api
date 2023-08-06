import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/entities/role.entity';
import { MessagesService } from 'src/messages/messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User, Role])],
  controllers: [CategoriesController],
  providers: [CategoriesService, UsersService, MessagesService],
})
export class CategoriesModule {}
