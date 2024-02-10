import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Variable {
  constructor(label: string, value: string) {
    this.label = label;
    this.value = value;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column({ nullable: true })
  value: string;
}
