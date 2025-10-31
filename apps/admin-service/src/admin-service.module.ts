import { AdminConfigModule } from './configs/admin-config.module';
import { AdminConfigService } from './configs/admin-config.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSourceService } from '@app/common/database/data-source.service';
import { NotificationGrpcModule } from './integrations/notification/notification-grpc.module';
import { AdminActionLogModule } from './modules/admin-action-log/admin-action-log.module';
import { LoanManagementModule } from './modules/loan-management/loan-management.module';
import { CustomerManagementModule } from './modules/customer-management/customer-management.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CoreServiceConfigService } from '@customer-service/configs/customer-service-config.service';

@Module({
  imports: [
    AdminConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AdminConfigModule],
      inject: [AdminConfigService],
      useFactory: async (appConfigService: AdminConfigService) =>
        appConfigService.getPostgresInfo(),
    }),
    JwtModule.registerAsync({
      imports: [AdminConfigModule],
      inject: [AdminConfigService],
      useFactory: async (configService: AdminConfigService) => ({
        secret: configService.jwtSecretKey,
        signOptions: {
          expiresIn: configService.jwtExpiryTime,
        },
      }),
    }),
    NotificationGrpcModule,
    AdminActionLogModule,
    LoanManagementModule,
    CustomerManagementModule,
    AnalyticsModule,
    LoggerModule,
    HealthModule,
    ExceptionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    DataSourceService,
    {
      provide: CoreServiceConfigService,
      useExisting: AdminConfigService,
    },
  ],
})
export class AdminServiceModule {}
