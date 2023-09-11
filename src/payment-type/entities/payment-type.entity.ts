import { AbstractEntity } from 'src/entities/abstract.entity';
import { PaymentMethods } from 'src/paymentmethod/entities/paymentmethod.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('paymentmethodtypes')
export class PaymentType extends AbstractEntity {
  @Column({ unique: true })
  name: string;
  @OneToMany(() => PaymentMethods, (methods) => methods.type)
  paymentMethod: PaymentMethods;
}
