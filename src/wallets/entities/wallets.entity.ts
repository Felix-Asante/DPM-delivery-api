import { AbstractEntity } from 'src/entities/abstract.entity';
import { ManyToOne, Column, Entity, OneToMany, Index } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { WalletTransaction } from './wallet-transactions.entity';
import { PayoutRequest } from './payout-request.entity';

@Entity('wallets')
export class Wallet extends AbstractEntity {
  @ManyToOne(() => User, (user) => user.wallet)
  @Index('user_idx')
  user: User;

  @Column({ type: 'decimal', default: 0 })
  balance: number;

  @Column({ type: 'decimal', default: 0 })
  totalEarned: number;

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: WalletTransaction[];

  @OneToMany(() => PayoutRequest, (payoutRequest) => payoutRequest.wallet)
  payoutRequests: PayoutRequest[];
}
