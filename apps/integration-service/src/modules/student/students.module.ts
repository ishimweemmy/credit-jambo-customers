import { Module, forwardRef } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { DepartmentsModule } from '../department/departments.module';
import { StudentMarks } from './entities/student-marks.entity';
import { IndustrialAttachmentModule } from '../industrial-attachment/industrial-attachment.module';
import { RPRegisteredRegistered } from './entities/registered-students.entity';
import { Graduate } from './entities/graduate.entity';
import { CollegeIntegrationModule } from '../college/college.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentMarks,
      RPRegisteredRegistered,
      Graduate,
    ]),
    DepartmentsModule,
    forwardRef(() => IndustrialAttachmentModule),
    CollegeIntegrationModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
