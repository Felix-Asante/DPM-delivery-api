import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallets.entity';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet-transactions.entity';
import { WalletTransactionTypes } from 'src/utils/enums';
import { paginate } from 'nestjs-typeorm-paginate';
import { GetTransactionsDto } from './dto/get-transactions.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
  ) {}

  async creditWallet(userId: string, amount: number, reference: string) {
    let wallet = await this.walletRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!wallet) {
      wallet = this.walletRepo.create({
        user: { id: userId },
        balance: 0,
        totalEarned: 0,
      });
    }

    const prevBalance = Number(wallet.balance || 0);
    const newBalance = prevBalance + amount;
    const prevTotalEarned = Number(wallet.totalEarned || 0);
    const newTotalEarned = prevTotalEarned + amount;

    wallet.balance = newBalance;
    wallet.totalEarned = newTotalEarned;

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

    if (!wallet) throw new Error('Wallet not found');

    if (wallet.balance < amount) throw new Error('Insufficient balance');

    const prevBalance = Number(wallet.balance || 0);
    const newBalance = prevBalance - amount;
    const prevTotalEarned = Number(wallet.totalEarned || 0);
    const newTotalEarned = prevTotalEarned - amount;

    wallet.balance = newBalance;
    wallet.totalEarned = newTotalEarned;

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

  async getWalletByUserId(userId: string) {
    return this.walletRepo.findOne({
      where: { user: { id: userId } },
    });
  }

  async getWalletTransactions(userId: string, queries: GetTransactionsDto) {
    const { page = 1, limit = 10, type } = queries;

    const transactions = await paginate(
      this.txRepo,
      { page, limit },
      {
        where: { wallet: { user: { id: userId } }, ...(type ? { type } : {}) },
        order: { createdAt: 'DESC' },
      },
    );

    return transactions;
  }
}
