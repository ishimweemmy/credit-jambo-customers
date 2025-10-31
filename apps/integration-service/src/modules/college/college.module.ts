import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollegeIntegration } from './entities/college.entity';
import { CollegeModule as CollegeModuleEntity } from './entities/college-module.entity';
import { CollegeIntegrationService } from './college.service';
import { CollegeController } from './college.controller';
import { DepartmentsModule } from '../department/departments.module';
import { AcademicYearModule } from '../academic-year/academic-year.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CollegeIntegration, CollegeModuleEntity]),
    DepartmentsModule,
    AcademicYearModule,
  ],
  controllers: [CollegeController],
  providers: [CollegeIntegrationService],
  exports: [CollegeIntegrationService],
})
export class CollegeIntegrationModule {}
