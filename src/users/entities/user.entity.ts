import { AbstractEntity } from 'src/entities/abstract.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Role } from './role.entity';
import * as bcrypt from 'bcrypt';
import { Place } from 'src/places/entities/place.entity';

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

  @Column({ nullable: true })
  code: string;

  @Column({ nullable: true })
  codeUseCase: string;

  @Column({ nullable: true })
  codeExpiryDate: Date;

  @ManyToOne(() => Role, (role) => role.user)
  role: Role;

  @OneToOne(() => Place, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  adminFor: Place;

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
