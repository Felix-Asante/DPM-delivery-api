import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { BookingState, UserRoles } from 'src/utils/enums';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IFindUserQuery } from 'src/utils/interface';
import { imageFileFilter } from 'src/utils/helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { WalletService } from 'src/wallets/wallets.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiOperation({ summary: '(logged in users)' })
  findCurrentUser(@currentUser() user) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(Admin)' })
  @ApiQuery({
    name: 'role',
    required: false,
  })
  @ApiQuery({
    name: 'query',
    required: false,
  })
  findAll(@Query() query: IFindUserQuery) {
    return this.usersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @Get('count')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(super admin)' })
  getTotalUsers(@currentUser() user) {
    return this.usersService.getTotalUsers(user);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER)
  @Get('likes')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(user)' })
  getLikes(@currentUser() user) {
    return this.usersService.findLikes(user?.id);
  }
  @Get('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(user)' })
  @ApiOkResponse()
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Object.values(BookingState),
  })
  getBookings(@Query('status') status: string, @currentUser() user) {
    return this.usersService.findUserBookings(status, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      fileFilter: imageFileFilter,
    }),
  )
  @hasRoles(UserRoles.PLACE_ADMIN, UserRoles.USER, UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @currentUser() user: User,
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return this.usersService.update(id, updateUserDto, profilePicture, user);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiBadRequestResponse()
  @hasRoles(UserRoles.PLACE_ADMIN, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  changePassword(@Body() body: ChangePasswordDto, @currentUser() user: User) {
    return this.usersService.changePassword(user, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @hasRoles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.USER, UserRoles.COURIER)
  @Get('wallet')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiOperation({ summary: '(user, courier)' })
  getWallet(@currentUser() user: User) {
    return this.walletService.getWalletByUserId(user.id);
  }
}
