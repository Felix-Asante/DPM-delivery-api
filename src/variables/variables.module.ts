import { Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesController } from './variables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Variable } from './entities/variables.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Variable]), UsersModule],
  controllers: [VariablesController],
  providers: [VariablesService],
})
export class VariablesModule {}
