import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ProductsCategoryService } from './products-category.service';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { UpdateProductsCategoryDto } from './dto/update-product-category.dto';

@Controller('products-category')
@ApiTags('Products category')
export class ProductsCategoryController {
  constructor(
    private readonly productsCategoryService: ProductsCategoryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(super admin/place admin)' })
  create(@Body() createProductsCategoryDto: CreateProductsCategoryDto) {
    return this.productsCategoryService.create(createProductsCategoryDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiOperation({ summary: '(super admin)' })
  findAllProductsCategory() {
    return this.productsCategoryService.findAllProductsCategory();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsCategoryService.findCategoryById(id);
  }
  @Get(':slug/slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsCategoryService.findCategoryBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '(super admin/place admin)' })
  @ApiBadRequestResponse()
  update(
    @Param('id') id: string,
    @Body() updateProductsCategoryDto: UpdateProductsCategoryDto,
  ) {
    return this.productsCategoryService.updateCategory(
      updateProductsCategoryDto.name,
      id,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiBearerAuth()
  @ApiOperation({ summary: '(super admin /place admin)' })
  remove(@Param('id') id: string) {
    return this.productsCategoryService.deleteCategory(id);
  }
}
