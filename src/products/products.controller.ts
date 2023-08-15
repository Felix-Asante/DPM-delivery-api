import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { imageFileFilter } from 'src/utils/helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/CreateProductDto.dto';

@Controller('products')
@ApiTags('Products / service / Menu')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '(super admin/place admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFileFilter,
    }),
  )
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return await this.productsService.create(body, photo);
  }

  @Put(':id')
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '(super admin/place admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('photo', {
      fileFilter: imageFileFilter,
    }),
  )
  async updateProduct(
    @Body() body: CreateProductDto,
    @UploadedFile() photo: Express.Multer.File,
    @Param('id') productId: string,
  ) {
    return await this.productsService.updateProduct(body, photo, productId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.productsService.findProductById(id);
  }

  @Delete(':id')
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @ApiBearerAuth()
  async deleteProduct(@Param('id') productId: string) {
    return await this.productsService.deleteProduct(productId);
  }
}
