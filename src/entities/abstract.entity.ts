import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deletedAt',
    type: 'timestamp',
  })
  deletedAt: Date;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.updatedAt = new Date();
  }

  constructor() {
    super();
  }
}
