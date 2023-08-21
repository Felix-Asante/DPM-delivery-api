import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { MessagesService } from 'src/messages/messages.service';
import { LikesModule } from 'src/likes/likes.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), LikesModule],
  controllers: [UsersController],
  providers: [UsersService, MessagesService],
  exports: [UsersService],
})
export class UsersModule {}
