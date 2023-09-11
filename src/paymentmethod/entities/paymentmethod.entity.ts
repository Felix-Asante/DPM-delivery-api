import { AbstractEntity } from 'src/entities/abstract.entity';
import { PaymentType } from 'src/payment-type/entities/payment-type.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('paymentmethods')
export class PaymentMethods extends AbstractEntity {
  @Column()
  name: string;
  @Column({ nullable: true })
  short_code: string;
  @Column({ nullable: true })
  image: string;
  @ManyToOne(() => PaymentType, (type) => type.paymentMethod, { eager: true })
  type: PaymentType;
}
