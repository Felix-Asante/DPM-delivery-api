import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallets.entity';
import { WalletTransaction } from './entities/wallet-transactions.entity';
import { PayoutRequest } from './entities/payout-request.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletTransaction, PayoutRequest]),
    forwardRef(() => UsersModule),
  ],
  controllers: [WalletsController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletsModule {}
