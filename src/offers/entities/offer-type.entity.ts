import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Offer } from './offer.entity';

@Entity('offertypes')
export class OfferTypes extends AbstractEntity {
  @Column()
  name: string;

  @OneToMany(() => Offer, (offer) => offer.type)
  offers: Offer;
}
