import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/users/entities/user.entity';
import { BookingState, UserRoles } from 'src/utils/enums';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { IFindBookingQuery } from 'src/utils/interface';
import { RatePlaceDto } from 'src/reviews/dto/create-review.dto';

@Controller('bookings')
@ApiTags('Bookings')
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @hasRoles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: '(user)' })
  create(
    @Body() createBookingDto: CreateBookingDto,
    @currentUser() user: User,
  ) {
    return this.bookingsService.create(createBookingDto, user);
  }

  @Get()
  @ApiOperation({ summary: '(super admin)' })
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @hasRoles(UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(BookingState),
  })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'from', required: false, type: String })
  @ApiQuery({ name: 'to', required: false, type: String })
  @ApiQuery({ name: 'place', required: false, type: String })
  findAll(@Query() queries: IFindBookingQuery) {
    return this.bookingsService.findAll(queries);
  }
  @Get('ours')
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(place admin)' })
  @ApiOkResponse()
  @hasRoles(UserRoles.PLACE_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getPlaceBooking(@currentUser() user: User) {
    return this.bookingsService.findPlaceBookings(user.adminFor.id);
  }

  @Get(':id')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(place admin/super admin/user)' })
  @ApiOkResponse()
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findBookingById(id);
  }

  @Put(':id/cancel-booking')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/place admin)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ) {
    return this.bookingsService.changeBookingStatus(
      id,
      BookingState.CANCELLED,
      user,
    );
  }

  @Put(':id/confirm-booking')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/place admin)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  confirmBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ) {
    return this.bookingsService.changeBookingStatus(
      id,
      BookingState.CONFIRMED,
      user,
    );
  }
  @Put(':id/deliver-booking')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/place admin)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deliverBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ) {
    return this.bookingsService.changeBookingStatus(
      id,
      BookingState.DELIVERED,
      user,
    );
  }

  @Put(':id/reject-booking')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/place admin)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.USER, UserRoles.PLACE_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  rejectBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @currentUser() user: User,
  ) {
    return this.bookingsService.changeBookingStatus(
      id,
      BookingState.REJECTED,
      user,
    );
  }

  @Delete(':id')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/user)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id', ParseUUIDPipe) id: string, @currentUser() user: User) {
    return this.bookingsService.remove(id, user);
  }
  @Get('all/count')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/user)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findTotalBooking(@currentUser() user: User) {
    return this.bookingsService.findTotalBooking(user);
  }
  @Get('all/sales')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @ApiOperation({ summary: '(super admin/user)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.PLACE_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({
    name: 'year',
    required: false,
  })
  getSales(@Query('year') year: string) {
    return this.bookingsService.getBookingsByYear(+year);
  }

  @ApiCreatedResponse({
    description: 'Rating has been successfully created.',
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiNotFoundResponse({ description: 'booking not found' })
  @ApiBearerAuth()
  @ApiOperation({ summary: '(User)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER)
  @Post(':id/rate')
  async ratePlace(
    @currentUser() user: User,
    @Body() ratePlaceDto: RatePlaceDto,
    @Param('id') id: string,
  ) {
    return await this.bookingsService.rateBooking(user, ratePlaceDto, id);
  }
}
