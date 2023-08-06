import { AbstractEntity } from 'src/entities/abstract.entity';
import { Place } from 'src/places/entities/place.entity';
import { slugify } from 'src/utils/helpers';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

@Entity('categories')
export class Category extends AbstractEntity {
  @Column()
  name: string;
  @Column()
  image: string;
  @Column()
  slug: string;
  @Column()
  imgId: string;

  @OneToMany(() => Place, (place) => place.category)
  place: Place;

  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    this.slug = slugify(this.name);
  }
  toJSON() {
    delete this.imgId;
    return this;
  }
}
