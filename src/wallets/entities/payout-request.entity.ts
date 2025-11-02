import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Wallet } from './wallets.entity';
import { PayoutRequestStatus, PayoutMethod } from 'src/utils/enums';

@Entity('payout_requests')
export class PayoutRequest extends AbstractEntity {
  @ManyToOne(() => User, { nullable: false })
  @Index('payout_rider_idx')
  rider: User;

  @ManyToOne(() => Wallet, { nullable: false })
  @Index('payout_wallet_idx')
  wallet: Wallet;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PayoutRequestStatus,
    default: PayoutRequestStatus.PENDING,
  })
  @Index('payout_status_idx')
  status: PayoutRequestStatus;

  @Column({
    type: 'enum',
    enum: PayoutMethod,
  })
  payoutMethod: PayoutMethod;

  // Payment details based on payout method
  @Column({ nullable: true })
  accountNumber: string;

  @Column({ nullable: true })
  accountName: string;

  @Column({ nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankCode: string;

  @Column({ nullable: true })
  mobileMoneyProvider: string; // e.g., MTN, Vodafone, AirtelTigo

  @Column({ nullable: true })
  mobileMoneyNumber: string;

  @Column({ nullable: true })
  mobileMoneyAccountName: string;

  // Transaction tracking
  @Column({ unique: true })
  @Index('payout_reference_idx')
  reference: string; // Unique internal reference

  @Column({ nullable: true })
  externalReference: string; // Payment provider reference

  @Column({ nullable: true })
  transactionId: string; // Transaction ID from payment provider

  // Audit and compliance
  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  notes: string; // Internal notes

  @ManyToOne(() => User, { nullable: true })
  approvedBy: User; // Admin who approved

  @Column({ nullable: true })
  approvedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  processedBy: User; // Admin who processed

  @Column({ nullable: true })
  processedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  // Fee and charges
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  netAmount: number; // Amount after fees

  // IP tracking for security
  @Column({ nullable: true })
  requestIp: string;

  // Retry mechanism
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  lastRetryAt: Date;

  // Metadata for additional context
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Indexes for common queries
  @Index(['rider', 'status'])
  static riderStatusIndex: void;

  @Index(['createdAt', 'status'])
  static dateStatusIndex: void;
}
