import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from 'src/files/files.module';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { UsersModule } from 'src/users/users.module';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { Complaint } from './entities/complaint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint, ShippingOrder]),
    FilesModule,
    UsersModule,
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
})
export class ComplaintsModule {}
