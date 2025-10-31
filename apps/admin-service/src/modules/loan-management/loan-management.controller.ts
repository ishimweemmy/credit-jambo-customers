import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LoanManagementService } from './loan-management.service';
import { RolesGuard } from '@customer-service/guards/role.guard';
import { PreAuthorize } from '@customer-service/decorators/auth.decorator';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { QueryLoansDto } from './dto/query-loans.dto';
import { ApproveLoanDto, RejectLoanDto } from './dto/approve-loan.dto';
import { DisburseLoanDto } from './dto/disburse-loan.dto';

@ApiTags('Admin - Loan Management')
@ApiBearerAuth()
@Controller('admin/loans')
@UseGuards(RolesGuard)
@PreAuthorize(EUserRole.ADMIN)
export class LoanManagementController {
  constructor(private readonly loanManagementService: LoanManagementService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get all loans pending review' })
  @ApiResponse({
    status: 200,
    description: 'Returns loans pending admin review',
  })
  async getPendingLoans(@Query() query: QueryLoansDto) {
    return this.loanManagementService.getPendingLoans(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active loans' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active loans',
  })
  async getActiveLoans(@Query() query: QueryLoansDto) {
    return this.loanManagementService.getActiveLoans(query);
  }

  @Get('defaulted')
  @ApiOperation({ summary: 'Get all defaulted loans' })
  @ApiResponse({
    status: 200,
    description: 'Returns all defaulted loans',
  })
  async getDefaultedLoans(@Query() query: QueryLoansDto) {
    return this.loanManagementService.getDefaultedLoans(query);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan approved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Loan is not in pending review status',
  })
  async approveLoan(
    @Param('id') loanId: string,
    @Body() dto: ApproveLoanDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.loanManagementService.approveLoan(
      loanId,
      adminId,
      dto,
      ipAddress,
      userAgent,
    );
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Loan is not in pending review status',
  })
  async rejectLoan(
    @Param('id') loanId: string,
    @Body() dto: RejectLoanDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.loanManagementService.rejectLoan(
      loanId,
      adminId,
      dto,
      ipAddress,
      userAgent,
    );
  }

  @Post(':id/disburse')
  @ApiOperation({ summary: 'Disburse an approved loan' })
  @ApiParam({ name: 'id', description: 'Loan ID' })
  @ApiResponse({
    status: 200,
    description: 'Loan disbursed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Loan not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Loan must be approved before disbursement',
  })
  async disburseLoan(
    @Param('id') loanId: string,
    @Body() dto: DisburseLoanDto,
    @Req() req: any,
  ) {
    const adminId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.loanManagementService.disburseLoan(
      loanId,
      adminId,
      dto,
      ipAddress,
      userAgent,
    );
  }
}
