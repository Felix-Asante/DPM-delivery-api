import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ComplaintCategory } from 'src/utils/enums';

export class CreateComplaintDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trackingNumber: string;

  @ApiProperty({ enum: ComplaintCategory })
  @IsEnum(ComplaintCategory)
  category: ComplaintCategory;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  issue: string;
}
