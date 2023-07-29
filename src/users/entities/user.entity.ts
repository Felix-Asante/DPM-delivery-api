import { AbstractEntity } from 'src/entities/abstract.entity';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  phone: string;
  @Column({ nullable: true })
  email: string;
  @Column()
  fullName: string;
  @Column({ nullable: true })
  address: string;
  @Column()
  password: string;
  @Column({ default: false })
  isVerified: boolean;
  @ManyToOne(() => Role, (role) => role.user)
  role: string;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  toJSON() {
    delete this.password;
    return this;
  }
}
