import { Module } from '@nestjs/common';
import { TeacherService } from './teachers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/techer.entity';
import { TeacherController } from './teachers.controller';
import { DepartmentsModule } from '../department/departments.module';
import { DepartmentIntegration } from '../department/entitites/department.entity';
import { CollegeIntegrationModule } from '../college/college.module';
import { HodLecturer } from './entities/hod.entity';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher, DepartmentIntegration, HodLecturer]),
    DepartmentsModule,
    CollegeIntegrationModule,
    UserModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeachersModule {}
