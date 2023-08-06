import { AbstractEntity } from 'src/entities/abstract.entity';
import { Place } from 'src/places/entities/place.entity';
import { slugify } from 'src/utils/helpers';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

@Entity('productsCategory')
export class ProductsCategory extends AbstractEntity {
  @Column()
  name: string;
  @Column()
  slug: string;
  @ManyToOne(() => Place, (place) => place.productCategory)
  place: Place;

  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    this.slug = slugify(this.name);
  }
}
