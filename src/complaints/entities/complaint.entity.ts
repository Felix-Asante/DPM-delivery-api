import { AbstractEntity } from 'src/entities/abstract.entity';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { ComplaintCategory } from 'src/utils/enums';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity('complaints')
export class Complaint extends AbstractEntity {
  @Column()
  fullName: string;

  @Column()
  phone: string;

  @Column()
  @Index('complaint_tracking_number_idx')
  trackingNumber: string;

  @Column({
    type: 'enum',
    enum: ComplaintCategory,
  })
  category: ComplaintCategory;

  @Column({ type: 'text' })
  issue: string;

  @Column({ nullable: true })
  picture: string;

  @ManyToOne(() => ShippingOrder, { eager: true })
  order: ShippingOrder;
}
