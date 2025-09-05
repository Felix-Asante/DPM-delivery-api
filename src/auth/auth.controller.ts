import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/resetPassword.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('signup')
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiCreatedResponse({ description: 'user created successfully' })
  create(@Body() createAuthDto: CreateUserDto) {
    return this.userService.create(createAuthDto);
  }

  @Get('verify-account/:code')
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiCreatedResponse({ description: 'Account verified successfully' })
  @ApiNotFoundResponse()
  async verifyAccount(@Param('code') code: string) {
    return await this.authService.verifyAccount(code);
  }

  @Post('login')
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse()
  @ApiCreatedResponse()
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
  @Post('forgotPassword')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse()
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordResetCode(body.phone);
  }
  @Post('resetPassword/:code')
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiNotFoundResponse()
  resetPassword(@Body() body: ResetPasswordDto, @Param('code') code: string) {
    return this.authService.resetPassword(body, code);
  }
}
