import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
import { FilesModule } from 'src/files/files.module';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from 'src/messages/messages.service';
import { Role } from 'src/users/entities/role.entity';
import { LikesModule } from 'src/likes/likes.module';
import { Booking } from 'src/bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Products, ProductsCategory, User, Role, Booking]),
    FilesModule,
    LikesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, UsersService, MessagesService],
  exports: [ProductsService],
})
export class ProductsModule {}
