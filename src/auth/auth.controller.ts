import { Controller, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

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

  @Post('login')
  findOne(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
