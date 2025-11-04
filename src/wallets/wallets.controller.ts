import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Patch,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { WalletService } from './wallets.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { currentUser } from 'src/auth/decorators/currentUser.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreatePayoutRequestDto } from './dto/create-payout-request.dto';
import { UpdatePayoutRequestStatusDto } from './dto/update-payout-request.dto';
import { GetPayoutRequestsDto } from './dto/get-payout-requests.dto';
import { Request } from 'express';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletService) {}

  @Get('payout-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all payout requests with filters (Admin only)',
  })
  @ApiOkResponse({ description: 'Payout requests retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admins only' })
  async getAllPayoutRequests(@Query() queries: GetPayoutRequestsDto) {
    return this.walletsService.getAllPayoutRequests(queries);
  }

  @Post('payout-request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.COURIER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Request a payout from wallet balance (Rider only)',
  })
  @ApiCreatedResponse({ description: 'Payout request created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Riders only' })
  @ApiBadRequestResponse({
    description: 'Invalid request or insufficient balance',
  })
  async createPayoutRequest(
    @currentUser() user: User,
    @Body() createPayoutRequestDto: CreatePayoutRequestDto,
    @Req() request: Request,
  ) {
    const requestIp = request.ip || request.headers['x-forwarded-for'];
    return this.walletsService.createPayoutRequest(
      user,
      createPayoutRequestDto,
      requestIp as string,
    );
  }

  @Patch('payout-request/:id/update-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a payout request status (Admin only)',
  })
  @ApiOkResponse({ description: 'Payout request status updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admins only' })
  @ApiNotFoundResponse({ description: 'Payout request not found' })
  @ApiBadRequestResponse({
    description: 'Invalid request status or insufficient balance',
  })
  async approvePayoutRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @currentUser() user: User,
    @Body() updateDto?: UpdatePayoutRequestStatusDto,
  ) {
    return this.walletsService.approvePayoutRequest(id, user.id, updateDto);
  }
}
