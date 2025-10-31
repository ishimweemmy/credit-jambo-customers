import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { ELoanStatus } from '@customer-service/modules/loan/enums/loan-status.enum';
import { EApprovalStatus } from '@customer-service/modules/loan/enums/approval-status.enum';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _400 } from '@app/common/constants/errors-constants';
import { AdminActionLogService } from '../admin-action-log/admin-action-log.service';
import { EAdminActionType } from '../admin-action-log/entities/admin-action-log.entity';
import { NotificationGrpcService } from '../../integrations/notification/notification-grpc.service';
import { QueryLoansDto } from './dto/query-loans.dto';
import { ApproveLoanDto, RejectLoanDto } from './dto/approve-loan.dto';
import { DisburseLoanDto } from './dto/disburse-loan.dto';

@Injectable()
export class LoanManagementService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly adminActionLogService: AdminActionLogService,
    private readonly notificationGrpcService: NotificationGrpcService,
  ) {}

  async getPendingLoans(query: QueryLoansDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [loans, total] = await this.loanRepository.findAndCount({
      where: {
        approvalStatus: EApprovalStatus.PENDING_REVIEW,
      },
      relations: ['user', 'creditAccount', 'savingsAccount'],
      order: {
        requestedAt: 'ASC', // FIFO - First requested, first shown
      },
      take: limit,
      skip,
    });

    return {
      data: loans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getActiveLoans(query: QueryLoansDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [loans, total] = await this.loanRepository.findAndCount({
      where: {
        status: ELoanStatus.ACTIVE,
      },
      relations: ['user', 'creditAccount'],
      order: {
        disbursedAt: 'DESC',
      },
      take: limit,
      skip,
    });

    return {
      data: loans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDefaultedLoans(query: QueryLoansDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [loans, total] = await this.loanRepository.findAndCount({
      where: {
        status: ELoanStatus.DEFAULTED,
      },
      relations: ['user', 'creditAccount'],
      order: {
        dueDate: 'ASC', // Oldest defaults first
      },
      take: limit,
      skip,
    });

    return {
      data: loans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveLoan(
    loanId: string,
    adminId: string,
    dto: ApproveLoanDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    if (loan.approvalStatus !== EApprovalStatus.PENDING_REVIEW) {
      this.exceptionHandler.throwBadRequest(_400.LOAN_NOT_PENDING_REVIEW);
    }

    // Update loan status
    loan.approvalStatus = EApprovalStatus.MANUAL_APPROVED;
    loan.status = ELoanStatus.APPROVED;
    loan.approvedAt = new Date();
    loan.approvedBy = { id: adminId } as any;

    await this.loanRepository.save(loan);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.LOAN_APPROVED,
      adminId,
      targetId: loan.id,
      targetType: 'Loan',
      metadata: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount.toString(),
        userId: loan.user.id,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'loan-approved',
        [loan.user.email],
        {
          customerName: `${loan.user.firstName} ${loan.user.lastName}`,
          loanNumber: loan.loanNumber,
          amount: loan.principalAmount.toString(),
        },
        'admin',
        loan.id,
      );
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to send loan approval notification:', error);
    }

    return loan;
  }

  async rejectLoan(
    loanId: string,
    adminId: string,
    dto: RejectLoanDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    if (loan.approvalStatus !== EApprovalStatus.PENDING_REVIEW) {
      this.exceptionHandler.throwBadRequest(_400.LOAN_NOT_PENDING_REVIEW);
    }

    // Update loan status
    loan.approvalStatus = EApprovalStatus.REJECTED;
    loan.status = ELoanStatus.REJECTED;

    await this.loanRepository.save(loan);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.LOAN_REJECTED,
      adminId,
      targetId: loan.id,
      targetType: 'Loan',
      metadata: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount.toString(),
        userId: loan.user.id,
        rejectionReason: dto.reason,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'loan-rejected',
        [loan.user.email],
        {
          customerName: `${loan.user.firstName} ${loan.user.lastName}`,
          loanNumber: loan.loanNumber,
          amount: loan.principalAmount.toString(),
          reason: dto.reason,
        },
        'admin',
        loan.id,
      );
    } catch (error) {
      console.error('Failed to send loan rejection notification:', error);
    }

    return loan;
  }

  async disburseLoan(
    loanId: string,
    adminId: string,
    dto: DisburseLoanDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['user', 'creditAccount', 'savingsAccount'],
    });

    if (!loan) {
      this.exceptionHandler.throwNotFound(_404.LOAN_NOT_FOUND);
    }

    if (loan.status !== ELoanStatus.APPROVED) {
      this.exceptionHandler.throwBadRequest(_400.LOAN_NOT_APPROVED);
    }

    // Update loan status
    loan.status = ELoanStatus.DISBURSED;
    loan.disbursedAt = new Date();

    // Note: Actual disbursement logic (crediting savings account, etc.)
    // would be handled by a separate service or integration
    // This is just updating the loan status

    await this.loanRepository.save(loan);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.LOAN_DISBURSED,
      adminId,
      targetId: loan.id,
      targetType: 'Loan',
      metadata: {
        loanNumber: loan.loanNumber,
        principalAmount: loan.principalAmount.toString(),
        userId: loan.user.id,
        savingsAccountId: loan.savingsAccount?.id,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'loan-disbursed',
        [loan.user.email],
        {
          customerName: `${loan.user.firstName} ${loan.user.lastName}`,
          loanNumber: loan.loanNumber,
          amount: loan.principalAmount.toString(),
        },
        'admin',
        loan.id,
      );
    } catch (error) {
      console.error('Failed to send loan disbursement notification:', error);
    }

    return loan;
  }
}
