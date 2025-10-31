import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { LoanManagementService } from './loan-management.service';
import { LoanManagementController } from './loan-management.controller';
import { AdminActionLogModule } from '../admin-action-log/admin-action-log.module';
import { NotificationGrpcModule } from '../../integrations/notification/notification-grpc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan]),
    AdminActionLogModule,
    NotificationGrpcModule,
  ],
  controllers: [LoanManagementController],
  providers: [LoanManagementService],
  exports: [LoanManagementService],
})
export class LoanManagementModule {}
