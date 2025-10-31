import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { EUserStatus } from '@customer-service/modules/user/enums/user-status.enum';
import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _404, _400 } from '@app/common/constants/errors-constants';
import { AdminActionLogService } from '../admin-action-log/admin-action-log.service';
import { EAdminActionType } from '../admin-action-log/entities/admin-action-log.entity';
import { NotificationGrpcService } from '../../integrations/notification/notification-grpc.service';
import { QueryCustomersDto } from './dto/query-customers.dto';
import {
  SuspendCustomerDto,
  UnsuspendCustomerDto,
  UpdateCreditLimitDto,
  UpdateCreditScoreDto,
} from './dto/update-customer.dto';

@Injectable()
export class CustomerManagementService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditAccount)
    private readonly creditAccountRepository: Repository<CreditAccount>,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly adminActionLogService: AdminActionLogService,
    private readonly notificationGrpcService: NotificationGrpcService,
  ) {}

  async getCustomers(query: QueryCustomersDto) {
    const { page, limit, search, status, kycStatus } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: EUserRole.CUSTOMER });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.customerId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (kycStatus) {
      queryBuilder.andWhere('user.kycStatus = :kycStatus', { kycStatus });
    }

    const [customers, total] = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(customerId: string) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    // Get credit account
    const creditAccount = await this.creditAccountRepository.findOne({
      where: { user: { id: customerId } },
    });

    // Get recent action logs
    const [actionLogs] = await this.adminActionLogService.findByTarget(
      customerId,
      'User',
    );

    return {
      customer,
      creditAccount,
      recentActions: actionLogs.slice(0, 10), // Last 10 actions
    };
  }

  async suspendCustomer(
    customerId: string,
    adminId: string,
    dto: SuspendCustomerDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    if (customer.status === EUserStatus.SUSPENDED) {
      this.exceptionHandler.throwBadRequest(_400.CUSTOMER_ALREADY_SUSPENDED);
    }

    // Update customer status
    customer.status = EUserStatus.SUSPENDED;
    await this.userRepository.save(customer);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CUSTOMER_SUSPENDED,
      adminId,
      targetId: customer.id,
      targetType: 'User',
      metadata: {
        customerId: customer.customerId,
        previousStatus: EUserStatus.ACTIVE,
        reason: dto.reason,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'account-suspended',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          reason: dto.reason,
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send suspension notification:', error);
    }

    return customer;
  }

  async unsuspendCustomer(
    customerId: string,
    adminId: string,
    dto: UnsuspendCustomerDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    if (customer.status !== EUserStatus.SUSPENDED) {
      this.exceptionHandler.throwBadRequest(_400.CUSTOMER_NOT_SUSPENDED);
    }

    // Update customer status
    customer.status = EUserStatus.ACTIVE;
    await this.userRepository.save(customer);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CUSTOMER_UNSUSPENDED,
      adminId,
      targetId: customer.id,
      targetType: 'User',
      metadata: {
        customerId: customer.customerId,
        previousStatus: EUserStatus.SUSPENDED,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'account-unsuspended',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send unsuspension notification:', error);
    }

    return customer;
  }

  async updateCreditLimit(
    customerId: string,
    adminId: string,
    dto: UpdateCreditLimitDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    const creditAccount = await this.creditAccountRepository.findOne({
      where: { user: { id: customerId } },
    });

    if (!creditAccount) {
      this.exceptionHandler.throwNotFound(_404.CREDIT_ACCOUNT_NOT_FOUND);
    }

    const oldLimit = creditAccount.creditLimit;
    const difference = dto.newLimit - Number(oldLimit);

    // Update credit limit and available credit
    creditAccount.creditLimit = dto.newLimit;
    creditAccount.availableCredit = Number(creditAccount.availableCredit) + difference;

    await this.creditAccountRepository.save(creditAccount);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CREDIT_LIMIT_UPDATED,
      adminId,
      targetId: creditAccount.id,
      targetType: 'CreditAccount',
      metadata: {
        customerId: customer.customerId,
        oldLimit: oldLimit.toString(),
        newLimit: dto.newLimit.toString(),
        reason: dto.reason,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'credit-limit-updated',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          oldLimit: oldLimit.toString(),
          newLimit: dto.newLimit.toString(),
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send credit limit update notification:', error);
    }

    return { customer, creditAccount };
  }

  async updateCreditScore(
    customerId: string,
    adminId: string,
    dto: UpdateCreditScoreDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const customer = await this.userRepository.findOne({
      where: { id: customerId, role: EUserRole.CUSTOMER },
    });

    if (!customer) {
      this.exceptionHandler.throwNotFound(_404.CUSTOMER_NOT_FOUND);
    }

    const oldScore = customer.creditScore;
    customer.creditScore = dto.newScore;

    await this.userRepository.save(customer);

    // Log admin action
    await this.adminActionLogService.logAction({
      actionType: EAdminActionType.CREDIT_SCORE_UPDATED,
      adminId,
      targetId: customer.id,
      targetType: 'User',
      metadata: {
        customerId: customer.customerId,
        oldScore: oldScore.toString(),
        newScore: dto.newScore.toString(),
        reason: dto.reason,
      },
      notes: dto.notes,
      ipAddress,
      userAgent,
    });

    // Send notification via gRPC
    try {
      await this.notificationGrpcService.sendEmail(
        'credit-score-updated',
        [customer.email],
        {
          customerName: `${customer.firstName} ${customer.lastName}`,
          oldScore: oldScore.toString(),
          newScore: dto.newScore.toString(),
        },
        'admin',
        customer.id,
      );
    } catch (error) {
      console.error('Failed to send credit score update notification:', error);
    }

    return customer;
  }
}

