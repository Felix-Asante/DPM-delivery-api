import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

export type OpeningHoursRangeType = {
  from: string;
  to: string;
};

export type DayOpeningHoursType = {
  closed?: boolean | string;
  openAllDay?: boolean | string;
  ranges?: OpeningHoursRangeType[];
};

export type OpeningHoursExceptionType = {
  name: string;
  date: string;
  repeating: boolean;
};

@Entity('opening_hours')
export class OpeningHours extends AbstractEntity {
  @Column('json')
  monday: DayOpeningHoursType;

  @Column('json')
  tuesday: DayOpeningHoursType;

  @Column('json')
  wednesday: DayOpeningHoursType;

  @Column('json')
  thursday: DayOpeningHoursType;

  @Column('json')
  friday: DayOpeningHoursType;

  @Column('json')
  saturday: DayOpeningHoursType;

  @Column('json')
  sunday: DayOpeningHoursType;

  @Column('json', { default: [] })
  exceptions: OpeningHoursExceptionType[];
}
