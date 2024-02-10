import { Booking } from 'src/bookings/entities/booking.entity';
import { Category } from 'src/categories/entities/category.entity';
import { AbstractEntity } from 'src/entities/abstract.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
import { Products } from 'src/products/entities/product.entity';
import { slugify } from 'src/utils/helpers';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OpeningHours } from './opening-hours.entity';

@Entity('places')
export class Place extends AbstractEntity {
  @Column()
  name: string;
  @Column()
  email: string;
  @Column()
  phone: string;
  @Column()
  longitude: string;
  @Column()
  latitude: string;
  @Column()
  website: string;
  @Column()
  logo: string;
  @Column()
  mainImage: string;
  @Column({ default: false })
  isVerified: boolean;
  @Column()
  slug: string;
  @Column()
  address: string;
  @Column({ default: 0 })
  visits: number;
  @Column({ default: 0 })
  averagePrice: number;
  @Column({ default: 0 })
  deliveryFee: number;
  @Column({ default: 5 })
  minPrepTime: number;
  @Column({ default: 15 })
  maxPrepTime: number;
  @ManyToOne(() => Category, (category) => category.place, { eager: true })
  category: Category;
  @OneToMany(() => ProductsCategory, (category) => category.place, {
    onDelete: 'CASCADE',
    eager: true,
  })
  productCategory: ProductsCategory;
  @OneToMany(() => Offer, (offer) => offer.product, {
    onDelete: 'CASCADE',
  })
  // @ManyToMany(() => Booking, (booking) => booking.place)
  @OneToMany(() => Booking, (booking) => booking.place)
  @JoinTable()
  bookings: Booking;

  offers: Offer;
  @Column({ default: 0 })
  rating: number;
  @Column({ default: 0 })
  total_reviews: number;

  @OneToOne(() => OpeningHours, { eager: true })
  @JoinColumn()
  openingHours: OpeningHours;

  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    this.slug = slugify(this.name);
  }
}
