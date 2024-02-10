import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { VariablesService } from './variables.service';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRoles } from 'src/utils/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@ApiTags('Variables')
@Controller('variables')
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  @ApiCreatedResponse({
    description: 'The variable has been successfully created',
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiNotFoundResponse({ description: 'Special is not found' })
  @ApiOperation({ summary: '(Admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @Post()
  create(@Body() createVariableDto: CreateVariableDto) {
    return this.variablesService.create(createVariableDto);
  }

  @ApiOkResponse({ description: 'Return the list of variables' })
  @Get()
  findAll() {
    return this.variablesService.findAll();
  }

  @ApiOkResponse({ description: 'Return a single variable by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variablesService.findOne(+id);
  }

  @ApiOkResponse({ description: 'The variable has been successfully updated' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBearerAuth()
  @ApiOperation({ summary: '(Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVariableDto: UpdateVariableDto,
  ) {
    return this.variablesService.update(+id, updateVariableDto);
  }

  @ApiOkResponse({ description: 'The variable has been successfully deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiBearerAuth()
  @ApiOperation({ summary: '(Admin)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @hasRoles(UserRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variablesService.remove(+id);
  }
}
