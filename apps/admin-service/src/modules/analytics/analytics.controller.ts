import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '@customer-service/guards/role.guard';
import { PreAuthorize } from '@customer-service/decorators/auth.decorator';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@ApiTags('Admin - Analytics & Monitoring')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@PreAuthorize(EUserRole.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of transactions',
  })
  async getTransactions(@Query() query: QueryTransactionsDto) {
    return this.analyticsService.getTransactions(query);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics and metrics' })
  @ApiResponse({
    status: 200,
    description: 'Returns comprehensive dashboard statistics',
  })
  async getDashboard() {
    return this.analyticsService.getDashboardStats();
  }
}

