import { Category } from 'src/categories/entities/category.entity';
import { AbstractEntity } from 'src/entities/abstract.entity';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
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
  @ManyToOne(() => Category, (category) => category.place)
  category: Category;
  @OneToMany(() => ProductsCategory, (category) => category.place, {
    onDelete: 'CASCADE',
    eager: true,
  })
  productCategory: ProductsCategory;

  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    this.slug = slugify(this.name);
  }
}
