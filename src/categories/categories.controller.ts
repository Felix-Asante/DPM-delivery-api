import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from 'src/utils/helpers';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Category has been successfully created' })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '(super admin)' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @hasRoles(UserRoles.ADMIN)
  @UseInterceptors(
    FileInterceptor('picture', {
      fileFilter: imageFileFilter,
    }),
  )
  async createCategory(
    @Body() body: CreateCategoryDto,
    @UploadedFile() picture: Express.Multer.File,
  ) {
    return await this.categoriesService.createCategory(body, picture);
  }
  @Put(':id')
  @ApiCreatedResponse({ description: 'Category has been successfully updated' })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '(super admin)' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @hasRoles(UserRoles.ADMIN)
  @UseInterceptors(
    FileInterceptor('picture', {
      fileFilter: imageFileFilter,
    }),
  )
  async updateCategory(
    @Body() body: UpdateCategoryDto,
    @UploadedFile() picture: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return await this.categoriesService.updateCategory(body, id, picture);
  }

  @Get()
  async findAll() {
    return await this.categoriesService.getAllCategories();
  }
  @Get(':id')
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async getCategoryById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.findCategoryById(id);
  }
  @Get(':slug/slug')
  @ApiNotFoundResponse()
  async getCategoryBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.findCategoryBySlug(slug);
  }
  @Delete(':id')
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiBearerAuth()
  @ApiOperation({ summary: '(super admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoriesService.deleteCategory(id);
  }
}
