import { AbstractEntity } from 'src/entities/abstract.entity';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('products')
export class Products extends AbstractEntity {
  @Column({ nullable: true })
  description: string;
  @Column({ nullable: true })
  photo: string;
  @Column()
  name: string;

  @ManyToOne(
    () => ProductsCategory,
    (productCategory) => productCategory.products,
  )
  productCategory: ProductsCategory;
}
