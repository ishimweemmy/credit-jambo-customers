import { Module } from '@nestjs/common';
import { IntegrationConfigModule } from './configs/integration-config.module';
import { IntegrationConfigService } from './configs/integration-config.service';
import { ExceptionModule } from '@app/common/exceptions/exceptions.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@app/common/filters/exception.filters';
import { LoggerModule } from '@app/common/logger/logger.module';
import { HealthModule } from '@app/common/health/health.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from './modules/student/students.module';
import { TeachersModule } from './modules/teacher/teachers.module';
import { DepartmentsModule } from './modules/department/departments.module';
import { ProgramModule } from './modules/program/program.module';
import { CompanyModule } from './modules/company/company.module';
import { CollegeIntegrationModule } from './modules/college/college.module';
import { LOG_BOOK_ROOT_NAME } from './common/constants/db.constants';
import { IndustrialAttachmentModule } from './modules/industrial-attachment/industrial-attachment.module';
import { UserModule } from './modules/user/user.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';

@Module({
  imports: [
    IntegrationConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [IntegrationConfigModule],
      inject: [IntegrationConfigService],
      useFactory: async (appConfigService: IntegrationConfigService) =>
        appConfigService.getMysqlInfo(),
    }),
    TypeOrmModule.forRootAsync({
      imports: [IntegrationConfigModule],
      inject: [IntegrationConfigService],
      name: LOG_BOOK_ROOT_NAME,
      useFactory: async (appConfigService: IntegrationConfigService) =>
        appConfigService.getLogbookInfo(),
    }),
    LoggerModule,
    HealthModule,
    ExceptionModule,
    StudentsModule,
    AcademicYearModule,
    TeachersModule,
    DepartmentsModule,
    ProgramModule,
    CompanyModule,
    CollegeIntegrationModule,
    UserModule,
    IndustrialAttachmentModule,
    AcademicYearModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class IntegrationServiceModule {}
