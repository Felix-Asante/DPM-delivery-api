import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './CreateProductDto.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
