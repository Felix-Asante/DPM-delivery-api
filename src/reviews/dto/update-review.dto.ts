import { PartialType } from '@nestjs/swagger';
import { RatePlaceDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(RatePlaceDto) {}
