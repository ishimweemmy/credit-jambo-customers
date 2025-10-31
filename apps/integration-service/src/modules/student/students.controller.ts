import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { StudentsService } from './students.service';
import {
  GraduateLookup,
  StudentByRegistrationNumberDto,
  StudentLookupDto,
} from './dto/student-lookup.dto';
import {
  StudentGrpcMethods,
  GrpcServices,
} from '@integration-service/common/constants/grpc.constants';
import { Student } from './entities/student.entity';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';
import {
  StudentMarksLookupDto,
  StudentMarksResponse,
} from './dto/student_marks_lookup.dtp';

@Controller()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @GrpcMethod(GrpcServices.STUDENT_SERVICE, StudentGrpcMethods.FIND_STUDENT)
  async findStudent(
    studentLookupDto: StudentLookupDto,
  ): Promise<UserIntegrationResponseDto> {
    return this.studentsService.findStudentByEmailAndRegistationNumber(
      studentLookupDto,
    );
  }

  @GrpcMethod(
    GrpcServices.STUDENT_SERVICE,
    StudentGrpcMethods.FIND_STUDENT_BY_REGISTRATION_NUMBER,
  )
  async findStudentByRegistrationNumber(
    dto: StudentByRegistrationNumberDto,
  ): Promise<Student> {
    return this.studentsService.findStudentByRegistrationNumber(dto);
  }

  @GrpcMethod(
    GrpcServices.STUDENT_SERVICE,
    StudentGrpcMethods.FIND_STUDENT_MARKS,
  )
  async findStudentMarksByRegistrationNumber(
    studentLookupDto: StudentMarksLookupDto,
  ): Promise<StudentMarksResponse> {
    return await this.studentsService.findStudentMarksByRegistrationNumber(
      studentLookupDto,
    );
  }

  @GrpcMethod(
    GrpcServices.STUDENT_SERVICE,
    StudentGrpcMethods.FIND_GRADUATE_BY_REGISTRATION_NUMBER,
  )
  async findGraduateByRegstrationNumber(
    dto: GraduateLookup,
  ): Promise<UserIntegrationResponseDto> {
    return this.studentsService.findGraduateByRegstrationNumber(dto);
  }
}
