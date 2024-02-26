import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/users/entities/user.entity';
import { UserRoles } from 'src/utils/enums';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOkResponse({
    description: 'The review is found and returned successfully',
  })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiOperation({ summary: '(No auth)' })
  @Get(':id')
  async getOneReview(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reviewsService.findReviewById(id);
  }

  @ApiOkResponse({ description: 'The review has been successfully deleted' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBearerAuth()
  @ApiOperation({ summary: '(Admin/User)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN, UserRoles.USER)
  @Delete(':id')
  async deleteReview(
    @Param('id', ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ) {
    return await this.reviewsService.removeReview(id, user);
  }
}
