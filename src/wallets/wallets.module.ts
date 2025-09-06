import { Module } from '@nestjs/common';
import { WalletService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallets.entity';
import { WalletTransaction } from './entities/wallet-transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction])],
  controllers: [WalletsController],
  providers: [WalletService],
})
export class WalletsModule {}
