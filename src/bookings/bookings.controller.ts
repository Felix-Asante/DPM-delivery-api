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
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/users/entities/user.entity';
import { BookingState, UserRoles } from 'src/utils/enums';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

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
  findAll(@Query('status') status: string) {
    return this.bookingsService.findAll(status);
  }
  @Get('our')
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
  @ApiOperation({ summary: '(super admin/place admin/user)' })
  @hasRoles(UserRoles.ADMIN, UserRoles.USER, UserRoles.PLACE_ADMIN)
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
  @hasRoles(UserRoles.ADMIN, UserRoles.USER, UserRoles.PLACE_ADMIN)
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
}
