import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallets.entity';
import { Repository } from 'typeorm';
import { WalletTransaction } from './entities/wallet-transactions.entity';
import { WalletTransactionTypes, PayoutRequestStatus } from 'src/utils/enums';
import { paginate } from 'nestjs-typeorm-paginate';
import { GetTransactionsDto } from './dto/get-transactions.dto';
import { PayoutRequest } from './entities/payout-request.entity';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { UpdatePayoutRequestStatusDto } from './dto/update-payout-request.dto';
import { GetPayoutRequestsDto } from './dto/get-payout-requests.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly txRepo: Repository<WalletTransaction>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRequestRepo: Repository<PayoutRequest>,
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

  async getAllPayoutRequests(queries: GetPayoutRequestsDto) {
    const {
      page = 1,
      limit = 10,
      status,
      payoutMethod,
      riderId,
      reference,
      dateFrom,
      dateTo,
    } = queries;

    const queryBuilder = this.payoutRequestRepo
      .createQueryBuilder('payoutRequest')
      .leftJoinAndSelect('payoutRequest.rider', 'rider')
      .leftJoinAndSelect('payoutRequest.wallet', 'wallet')
      .leftJoinAndSelect('payoutRequest.approvedBy', 'approvedBy')
      .leftJoinAndSelect('payoutRequest.processedBy', 'processedBy');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('payoutRequest.status = :status', { status });
    }

    if (payoutMethod) {
      queryBuilder.andWhere('payoutRequest.payoutMethod = :payoutMethod', {
        payoutMethod,
      });
    }

    if (riderId) {
      queryBuilder.andWhere('rider.id = :riderId', { riderId });
    }

    if (reference) {
      queryBuilder.andWhere('payoutRequest.reference ILIKE :reference', {
        reference: `%${reference}%`,
      });
    }

    if (dateFrom) {
      queryBuilder.andWhere('payoutRequest.createdAt >= :dateFrom', {
        dateFrom: new Date(dateFrom),
      });
    }

    if (dateTo) {
      queryBuilder.andWhere('payoutRequest.createdAt <= :dateTo', {
        dateTo: new Date(dateTo),
      });
    }

    // Order by most recent first
    queryBuilder.orderBy('payoutRequest.createdAt', 'DESC');

    // Paginate results
    return paginate(queryBuilder, { page, limit });
  }

  async createPayoutRequest(
    riderId: string,
    dto: CreatePayoutRequestDto,
    requestIp?: string,
  ) {
    // Get the rider's wallet
    const wallet = await this.walletRepo.findOne({
      where: { user: { id: riderId } },
      relations: ['user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this rider');
    }

    // Check if the rider has sufficient balance
    const currentBalance = Number(wallet.balance || 0);
    if (currentBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${currentBalance}, Requested: ${dto.amount}`,
      );
    }

    // Check for minimum withdrawal amount (optional - you can customize this)
    const MIN_WITHDRAWAL_AMOUNT = 10;
    if (dto.amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new BadRequestException(
        `Minimum withdrawal amount is ${MIN_WITHDRAWAL_AMOUNT}`,
      );
    }

    // Check for pending or processing requests
    const pendingRequest = await this.payoutRequestRepo.findOne({
      where: {
        rider: { id: riderId },
        status: PayoutRequestStatus.PENDING,
      },
    });

    if (pendingRequest) {
      throw new BadRequestException(
        'You already have a pending payout request. Please wait for it to be processed.',
      );
    }

    // Generate unique reference
    const reference = `PAYOUT-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

    // Calculate processing fee (you can customize this logic)
    const PROCESSING_FEE_PERCENTAGE = 0.01; // 1%
    const processingFee = dto.amount * PROCESSING_FEE_PERCENTAGE;
    const netAmount = dto.amount - processingFee;

    // Create payout request
    const payoutRequest = this.payoutRequestRepo.create({
      rider: { id: riderId },
      wallet,
      amount: dto.amount,
      payoutMethod: dto.payoutMethod,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
      bankName: dto.bankName,
      bankCode: dto.bankCode,
      mobileMoneyProvider: dto.mobileMoneyProvider,
      mobileMoneyNumber: dto.mobileMoneyNumber,
      reference,
      status: PayoutRequestStatus.PENDING,
      notes: dto.notes,
      requestIp,
      processingFee,
      netAmount,
    });

    await this.payoutRequestRepo.save(payoutRequest);

    // Record the payout request as a pending transaction
    await this.txRepo.save(
      this.txRepo.create({
        wallet,
        amount: dto.amount,
        type: WalletTransactionTypes.PAYOUT_PENDING,
        reference,
      }),
    );

    return payoutRequest;
  }

  async approvePayoutRequest(
    payoutRequestId: string,
    adminId: string,
    dto?: UpdatePayoutRequestStatusDto,
  ) {
    // Get the payout request with relations
    const payoutRequest = await this.payoutRequestRepo.findOne({
      where: { id: payoutRequestId },
      relations: ['rider', 'wallet'],
    });

    if (!payoutRequest) {
      throw new NotFoundException('Payout request not found');
    }

    // Check if the request is in a valid state for approval
    if (payoutRequest.status !== PayoutRequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot approve a payout request with status: ${payoutRequest.status}`,
      );
    }

    // Verify the wallet still has sufficient balance
    const currentBalance = Number(payoutRequest.wallet.balance || 0);
    if (currentBalance < payoutRequest.amount) {
      throw new BadRequestException(
        `Insufficient wallet balance. Available: ${currentBalance}, Required: ${payoutRequest.amount}`,
      );
    }

    // Deduct the amount from the wallet
    if (dto?.status === PayoutRequestStatus.APPROVED) {
      payoutRequest.wallet.balance = currentBalance - payoutRequest.amount;
      await this.walletRepo.save(payoutRequest.wallet);
    }

    // Create a withdrawal transaction record
    await this.txRepo.save(
      this.txRepo.create({
        wallet: payoutRequest.wallet,
        amount: payoutRequest.amount,
        type: WalletTransactionTypes.WITHDRAWAL,
        reference: payoutRequest.reference,
      }),
    );

    // Update payout request status
    payoutRequest.status = dto?.status;
    if (dto?.status === PayoutRequestStatus.APPROVED) {
      payoutRequest.approvedBy = { id: adminId } as any;
      payoutRequest.approvedAt = new Date();
    }
    if (dto?.status === PayoutRequestStatus.PROCESSING) {
      payoutRequest.processedBy = { id: adminId } as any;
      payoutRequest.processedAt = new Date();
    }

    if (dto?.notes) {
      payoutRequest.notes = dto.notes;
    }
    if (dto?.externalReference) {
      payoutRequest.externalReference = dto.externalReference;
    }
    if (dto?.transactionId) {
      payoutRequest.transactionId = dto.transactionId;
    }

    await this.payoutRequestRepo.save(payoutRequest);

    return payoutRequest;
  }
}
