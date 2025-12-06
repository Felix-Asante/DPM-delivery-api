import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { UserRoles } from 'src/utils/enums';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { AnalyticsService } from './analytics.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('analytics')
@ApiTags('Analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @hasRoles(UserRoles.ADMIN)
  async getDashboardAnalytics() {
    return this.analyticsService.getDashboardAnalytics();
  }
}
