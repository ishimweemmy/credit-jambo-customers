import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { LoggerModule } from '@app/common/logger/logger.module';
import { CronsConfigModule } from './configs/crons-config.module';
import { CronsConfigService } from './configs/crons-config.service';
import { HealthModule } from '@app/common/health/health.module';
import { BankingModule } from './modules/banking/banking.module';
import { NotificationModule } from './integrations/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CronsConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [CronsConfigModule],
      inject: [CronsConfigService],
      useFactory: async (configService: CronsConfigService) =>
        configService.getPostgresInfo(),
    }),
    LoggerModule,
    HealthModule,
    NotificationModule,
    BankingModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class CronsModule {}
