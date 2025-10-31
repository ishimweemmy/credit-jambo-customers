import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { CustomerManagementService } from './customer-management.service';
import { CustomerManagementController } from './customer-management.controller';
import { AdminActionLogModule } from '../admin-action-log/admin-action-log.module';
import { NotificationGrpcModule } from '../../integrations/notification/notification-grpc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CreditAccount]),
    AdminActionLogModule,
    NotificationGrpcModule,
  ],
  controllers: [CustomerManagementController],
  providers: [CustomerManagementService],
  exports: [CustomerManagementService],
})
export class CustomerManagementModule {}

