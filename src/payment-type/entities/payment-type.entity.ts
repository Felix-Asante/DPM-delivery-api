import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity('paymentmethodtypes')
export class PaymentType extends AbstractEntity {
  @Column({ unique: true })
  name: string;
}
