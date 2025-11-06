import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRoles } from 'src/utils/enums';
import { CreateProductsCategoryDto } from './dto/create-products-category.dto';
import { UpdateProductsCategoryDto } from './dto/update-product-category.dto';
import { ProductsCategoryService } from './products-category.service';

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

  @Get('place/:placeId')
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  @ApiBadRequestResponse()
  async getPlaceCategory(@Param('placeId', ParseUUIDPipe) placeId: string) {
    return this.productsCategoryService.getPlaceCategory(placeId);
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
