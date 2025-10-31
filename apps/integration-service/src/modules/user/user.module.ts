import { Module } from '@nestjs/common';
import { UserIntegrationService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MISUser } from './entities/user.entity';
import { DepartmentsModule } from '@integration-service/modules/department/departments.module';
import { CollegeIntegrationModule } from '@integration-service/modules/college/college.module';
import { UserIntegrationController } from './user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MISUser]),
    CollegeIntegrationModule,
    DepartmentsModule,
  ],
  providers: [UserIntegrationService],
  controllers: [UserIntegrationController],
  exports: [UserIntegrationService],
})
export class UserModule {}
