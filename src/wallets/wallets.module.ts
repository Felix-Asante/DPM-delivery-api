import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallets.entity';
import { WalletTransaction } from './entities/wallet-transactions.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { UsersModule } from 'src/users/users.module';
import { MessagesModule } from 'src/messages/messages.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction, PayoutRequest, User]),
    forwardRef(() => UsersModule),
    MessagesModule,
  ],
  controllers: [WalletsController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletsModule {}
