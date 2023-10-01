import { Booking } from 'src/bookings/entities/booking.entity';
import { AbstractEntity } from 'src/entities/abstract.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { OrderedProducts } from './ordered-product.entity';

@Entity('products')
export class Products extends AbstractEntity {
  @Column({ nullable: true })
  description: string;
  @Column({ nullable: true })
  photo: string;
  @Column()
  name: string;
  @Column({ default: 0.0 })
  price: number;

  @OneToMany(() => Offer, (offer) => offer.product, {
    eager: true,
    onDelete: 'CASCADE',
  })
  offers: Offer;

  @ManyToOne(
    () => ProductsCategory,
    (productCategory) => productCategory.products,
    {
      onDelete: 'CASCADE',
    },
  )
  productCategory: ProductsCategory;
  // @OneToMany(() => Booking, (booking) => booking.place, { onDelete: 'CASCADE' })
  // bookings: Booking;

  @OneToMany(() => OrderedProducts, (orders) => orders.product)
  orders: OrderedProducts[];
}
