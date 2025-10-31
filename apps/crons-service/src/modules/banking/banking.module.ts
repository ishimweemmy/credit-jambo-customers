import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankingCronService } from './banking.cron.service';
import { SavingsCronService } from './services/savings-cron.service';
import { LoanCronService } from './services/loan-cron.service';
import { TierCronService } from './services/tier-cron.service';
import { SavingsAccount } from '@core-service/modules/savings/entities/savings-account.entity';
import { DailyBalanceSnapshot } from '@core-service/modules/savings/entities/daily-balance-snapshot.entity';
import { Loan } from '@core-service/modules/loan/entities/loan.entity';
import { Repayment } from '@core-service/modules/loan/entities/repayment.entity';
import { Transaction } from '@core-service/modules/transaction/entities/transaction.entity';
import { User } from '@core-service/modules/user/entities/user.entity';
import { TransactionService } from '@core-service/modules/transaction/transaction.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavingsAccount,
      DailyBalanceSnapshot,
      Loan,
      Repayment,
      Transaction,
      User,
    ]),
    ExceptionModule,
  ],
  providers: [
    BankingCronService,
    SavingsCronService,
    LoanCronService,
    TierCronService,
    TransactionService,
  ],
})
export class BankingModule {}
