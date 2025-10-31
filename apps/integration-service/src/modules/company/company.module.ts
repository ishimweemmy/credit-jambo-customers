import { Module } from '@nestjs/common';
import { CompanyIntegrationService } from './company.service';
import { CompanyIntegrationController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyIntegration } from './entities/company.entity';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyIntegration], LOG_BOOK_ROOT_NAME)],
  providers: [CompanyIntegrationService],
  controllers: [CompanyIntegrationController],
  exports: [CompanyIntegrationService],
})
export class CompanyModule {}
