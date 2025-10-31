import { Injectable } from '@nestjs/common';
import {
  GraduateLookup,
  StudentByRegistrationNumberDto,
  StudentLookupDto,
} from './dto/student-lookup.dto';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';
import { DepartmentsService } from '../department/departments.service';
import { StudentMarks } from './entities/student-marks.entity';
import {
  StudentMarksLookupDto,
  StudentMarksResponse,
} from './dto/student_marks_lookup.dtp';
import { IndustrialAttachmentService } from '../industrial-attachment/industrial-attachment.service';
import { Graduate } from './entities/graduate.entity';
import { CollegeIntegrationService } from '../college/college.service';
import { EducationLevel } from '@core-service/modules/user/enums/education-level.enum';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Graduate)
    private readonly graduateRepository: Repository<Graduate>,
    @InjectRepository(StudentMarks)
    private readonly studentMarksRepository: Repository<StudentMarks>,
    private readonly departmentService: DepartmentsService,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
    private readonly industrialAttachmentService: IndustrialAttachmentService,
    private readonly collegeService: CollegeIntegrationService,
  ) {}

  async findStudentByEmailAndRegistationNumber({
    registrationNumber,
    email,
  }: StudentLookupDto): Promise<UserIntegrationResponseDto> {
    if (!registrationNumber || !email)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);

    const student = await this.studentRepository.findOne({
      where: { email: email, registrationNumber: registrationNumber },
    });
    if (!student) {
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.STUDENT_NOT_FOUND);
    }
    if (!student?.departmentId) {
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.NO_DEPARTMENT_FOUND_FOR_STUDENT,
      );
    }
    if (!student?.collegeId) {
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.NO_COLLEGE_FOUND_FOR_STUDENT,
      );
    }
    const department = await this.departmentService.findDepartment({
      id: student?.departmentId,
    });
    const college = await this.collegeService.findCollege({
      id: student.collegeId,
    });

    const studentIntegrationResponse = new UserIntegrationResponseDto();
    studentIntegrationResponse.misDepartment = department;
    studentIntegrationResponse.firstName = student.firstName;
    studentIntegrationResponse.lastName = student.lastName;
    studentIntegrationResponse.email = student.email;
    studentIntegrationResponse.educationLevel = student.educationLevel;
    studentIntegrationResponse.gender = student.gender;
    studentIntegrationResponse.registrationNumber = student.registrationNumber;
    studentIntegrationResponse.telephone = student.telephone;
    studentIntegrationResponse.graduationYear = student.graduationYear;
    studentIntegrationResponse.graduationYear = student.yearOfStudy;
    studentIntegrationResponse.college = college;

    return studentIntegrationResponse;
  }

  async findStudentByRegistrationNumber({
    registrationNumber,
  }: StudentByRegistrationNumberDto): Promise<Student> {
    if (!registrationNumber)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);

    const student = await this.studentRepository.findOne({
      where: { registrationNumber: registrationNumber },
    });
    // const department = await this.departmentService.findDepartment({
    //   id: student.departmentId,
    // });
    if (!student)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.STUDENT_NOT_FOUND);
    return student;
  }

  async findStudentMarksByRegistrationNumber(
    studentLookupDto: StudentMarksLookupDto,
  ): Promise<StudentMarksResponse> {
    if (!studentLookupDto.registrationNumber) {
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);
    }

    const studentMarks = await this.studentMarksRepository.find({
      where: { registrationNumber: studentLookupDto.registrationNumber },
    });

    if (!studentMarks || studentMarks.length === 0) {
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.STUDENT_MARKS_NOT_FOUND,
      );
    }

    const response = new StudentMarksResponse();
    response.marks = studentMarks;
    return response;
  }

  async findGraduateByRegstrationNumber(dto: GraduateLookup) {
    const graduate: Graduate = await this.graduateRepository.findOne({
      where: {
        registrationNumber: dto.registrationNumber,
      },
    });
    const registeredStudent = await this.studentRepository.findOne({
      where: {
        registrationNumber: dto.registrationNumber,
      },
    });
    if (!registeredStudent || !graduate) {
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.NOT_FOUND);
    }

    const college = await this.collegeService.findCollege({
      id: registeredStudent.collegeId,
    });
    let department;
    if (registeredStudent?.departmentId) {
      department = await this.departmentService.findDepartment({
        id: registeredStudent?.departmentId,
      });
    }
    const userIntegrationResponse = new UserIntegrationResponseDto();

    userIntegrationResponse.firstName = registeredStudent.firstName;
    userIntegrationResponse.lastName = registeredStudent.lastName;
    userIntegrationResponse.email = registeredStudent.email;
    userIntegrationResponse.gender = registeredStudent.gender;
    userIntegrationResponse.registrationNumber = graduate.registrationNumber;
    userIntegrationResponse.telephone = registeredStudent.telephone;
    userIntegrationResponse.graduationYear = registeredStudent.graduationYear;
    userIntegrationResponse.educationLevel = EducationLevel.ALUMNI;
    userIntegrationResponse.college = college;
    userIntegrationResponse.academicYear = graduate.academicYear;
    userIntegrationResponse.misDepartment = department;

    return userIntegrationResponse;
  }
}
