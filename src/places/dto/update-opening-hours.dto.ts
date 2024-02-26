import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsString,
  Validate,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  isMilitaryTime,
} from 'class-validator';
import { DayOpeningHoursType } from '../entities/opening-hours.entity';

@ValidatorConstraint({ name: 'validateOpeningHoursDay', async: false })
class ValidateOpeningHoursDay implements ValidatorConstraintInterface {
  validate(value: DayOpeningHoursType): boolean {
    if (value?.ranges) {
      for (const range of value.ranges) {
        if (
          !range ||
          typeof range !== 'object' ||
          !range.from ||
          !range.to ||
          !isMilitaryTime(range.from) ||
          !isMilitaryTime(range.to)
        ) {
          return false;
        }
      }
    } else if (value?.openAllDay === true || value?.openAllDay === 'true') {
      return true;
    } else if (value?.closed === true || value?.closed === 'true') {
      return true;
    }
    return true;
  }

  defaultMessage(): string {
    return 'Please provide a valid value for the opening hours';
  }
}

function cleanDayOpeningHours(value: DayOpeningHoursType) {
  const cleanedValue: DayOpeningHoursType = {};
  if (value?.ranges) {
    cleanedValue.ranges = value.ranges.map((range) => ({
      from: range.from,
      to: range.to,
    }));
  } else if (value?.openAllDay === true || value?.openAllDay === 'true') {
    cleanedValue.openAllDay = true;
  } else if (value?.closed === true || value?.closed === 'true') {
    cleanedValue.closed = true;
  } else {
    cleanedValue.closed = true;
  }
  return cleanedValue;
}

class OpeningHoursExceptionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsDateString()
  @ApiProperty()
  date: string;

  @IsBoolean()
  @ApiProperty()
  @Transform(
    ({ value }) =>
      value === 'true' || value === true || value === 1 || value === '1',
  )
  repeating: boolean;
}

export class UpdateOpeningHoursDto {
  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  monday: DayOpeningHoursType;

  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  tuesday: DayOpeningHoursType;

  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  wednesday: DayOpeningHoursType;

  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  thursday: DayOpeningHoursType;

  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  friday: DayOpeningHoursType;

  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  saturday: DayOpeningHoursType;

  @IsObject()
  @ApiProperty()
  @Validate(ValidateOpeningHoursDay)
  @Transform(({ value }) => cleanDayOpeningHours(value))
  sunday: DayOpeningHoursType;

  @ValidateNested({ each: true })
  @Type(() => OpeningHoursExceptionDto)
  @ApiProperty()
  exceptions: OpeningHoursExceptionDto[];
}
