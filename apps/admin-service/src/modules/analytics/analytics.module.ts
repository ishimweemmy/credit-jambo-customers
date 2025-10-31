import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@customer-service/modules/transaction/entities/transaction.entity';
import { Loan } from '@customer-service/modules/loan/entities/loan.entity';
import { User } from '@customer-service/modules/user/entities/user.entity';
import { CreditAccount } from '@customer-service/modules/credit/entities/credit-account.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Loan, User, CreditAccount])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

