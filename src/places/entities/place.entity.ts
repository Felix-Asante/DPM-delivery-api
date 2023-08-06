import { Category } from 'src/categories/entities/category.entity';
import { AbstractEntity } from 'src/entities/abstract.entity';
import { slugify } from 'src/utils/helpers';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

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
  isVerified: boolean;
  @Column()
  slug: string;
  @Column()
  visits: number;
  @ManyToOne(() => Category, (category) => category.place)
  category: Category;
  @BeforeInsert()
  @BeforeUpdate()
  createSlug() {
    this.slug = slugify(this.name);
  }
}
