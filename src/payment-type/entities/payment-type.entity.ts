import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column } from 'typeorm';

export class PaymentType extends AbstractEntity {
  @Column()
  name: string;
}
