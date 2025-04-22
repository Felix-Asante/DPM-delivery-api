import { FilesModule } from './../files/files.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Rider } from './entities/rider.entity';
import { RiderController } from './rider.controller';
import { RiderService } from './rider.service';
import { Role } from 'src/users/entities/role.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    FilesModule,
    UsersModule,
    TypeOrmModule.forFeature([Rider, User, Role]),
  ],
  controllers: [RiderController],
  providers: [RiderService],
  exports: [RiderService],
})
export class RiderModule {}
