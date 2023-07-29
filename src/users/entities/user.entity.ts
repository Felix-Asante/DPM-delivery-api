import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  phone: string;
  @Column()
  email: string;
  @Column()
  address: string;
  @Column()
  password: string;
  @Column({ default: false })
  isVerified: boolean;
  @ManyToOne(() => Role, (role) => role.user)
  role: string;
}
