import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionService } from 'database-connection.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { Role } from './users/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    TypeOrmModule.forFeature([Role]),
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
