import { AbstractEntity } from 'src/entities/abstract.entity';
import { Place } from 'src/places/entities/place.entity';
import { Products } from 'src/products/entities/product.entity';
import { slugify } from 'src/utils/helpers';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity('productscategory')
export class ProductsCategory extends AbstractEntity {
  @Column()
  name: string;
  @Column()
  slug: string;
  @ManyToOne(() => Place, (place) => place.productCategory)
  place: Place;

  @OneToMany(() => Products, (product) => product.productCategory)
  products: Products;

  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    this.slug = slugify(this.name);
  }
}
