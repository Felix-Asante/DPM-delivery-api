import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { Wallet } from './wallets.entity';
import { WalletTransactionTypes } from 'src/utils/enums';

@Entity('wallet_transactions')
export class WalletTransaction extends AbstractEntity {
  @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
  @Index('wallet_idx')
  wallet: Wallet;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  type: WalletTransactionTypes;

  @Column({ nullable: true })
  reference: string;
}
