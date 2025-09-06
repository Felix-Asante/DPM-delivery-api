import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallets.entity';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet-transactions.entity';
import { WalletTransactionTypes } from 'src/utils/enums';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
  ) {}

  async creditWallet(userId: string, amount: number, reference: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    wallet.balance += amount;
    wallet.totalEarned += amount;

    await this.walletRepo.save(wallet);

    await this.txRepo.save(
      this.txRepo.create({
        wallet,
        amount,
        type: WalletTransactionTypes.PAYMENT_RECEIVED,
        reference,
      }),
    );
  }

  async debitWallet(userId: string, amount: number, reference: string) {
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (wallet.balance < amount) throw new Error('Insufficient balance');

    wallet.balance -= amount;

    await this.walletRepo.save(wallet);

    await this.txRepo.save(
      this.txRepo.create({
        wallet,
        amount,
        type: WalletTransactionTypes.DEBIT,
        reference,
      }),
    );
  }
}
