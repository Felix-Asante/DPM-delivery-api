import { Controller } from '@nestjs/common';
import { VariablesService } from './variables.service';

@Controller('variables')
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}
}
