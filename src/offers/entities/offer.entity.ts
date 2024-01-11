import { AbstractEntity } from 'src/entities/abstract.entity';
import { Place } from 'src/places/entities/place.entity';
import { Products } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { OfferTypes } from './offer-type.entity';

@Entity('offers')
export class Offer extends AbstractEntity {
  @Column()
  reductionPercent: number;

  @Column({ default: 0 })
  price: number;

  @Column({ default: new Date() })
  start_date: string;
  @Column()
  end_date: string;
  @Column({ nullable: true })
  title: string;
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Products, (product) => product.offers, {
    nullable: true,
  })
  product: Products;
  @ManyToOne(() => Place, (place) => place.offers, {
    nullable: true,
    eager: true,
  })
  place: Place;
  @ManyToOne(() => OfferTypes, (type) => type.offers, { eager: true })
  type: OfferTypes;
}
