import { AbstractEntity } from 'src/entities/abstract.entity';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity('likes')
export class Likes extends AbstractEntity {
  @ManyToOne(() => Place)
  place: Place;
  @ManyToOne(() => User)
  user: User;
}
