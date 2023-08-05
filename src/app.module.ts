import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionService } from 'database-connection.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { Role } from './users/entities/role.entity';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { JwtModule } from '@nestjs/jwt';
import { PlacesModule } from './places/places.module';
import { CategoriesModule } from './categories/categories.module';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    TypeOrmModule.forFeature([Role]),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '365 days' },
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    PlacesModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
