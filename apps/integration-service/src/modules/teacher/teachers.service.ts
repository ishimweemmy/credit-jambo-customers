import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { Teacher } from './entities/techer.entity';
import { TeacherLookupDto } from './dto/teacher-lookup.dto';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';
import { DepartmentsService } from '../department/departments.service';
import { CollegeIntegrationService } from '../college/college.service';
import { HodLecturer } from './entities/hod.entity';
import { UserIntegrationService } from '../user/user.service';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly lecturerRepository: Repository<Teacher>,
    @InjectRepository(HodLecturer)
    private readonly hodLecturerRepository: Repository<HodLecturer>,
    private readonly departmentService: DepartmentsService,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
    private readonly collegeService: CollegeIntegrationService,
    private readonly userService: UserIntegrationService,
  ) {}

  async findTeacher(
    dto: TeacherLookupDto,
  ): Promise<UserIntegrationResponseDto> {
    const lecturer = await this.lecturerRepository.findOne({
      where: {
        // nationId: dto.registrationNumber,
        email: dto.email,
      },
      relations: ['department'],
    });

    const lectuerUser = await this.userService.findByEmailAndNationalId(
      dto.email,
      dto.registrationNumber,
    );

    if (!lecturer)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.LECTURER_NOT_FOUND);

    let department = null;
    if (!lecturer?.departmentId && !lectuerUser?.department) {
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.NO_DEPARTMENT_FOUND_FOR_LECTURER,
      );
    }
    if (!lecturer?.college && !lectuerUser?.college) {
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.NO_COLLEGE_FOUND_FOR_LECTURER,
      );
    }

    const departmentId = lecturer?.departmentId || lectuerUser?.department;
    const collegeId = lecturer?.college || lectuerUser?.college;

    try {
      department = await this.departmentService.findDepartment({
        id: departmentId,
      });
    } catch (error) {
      department = null;
    }

    const college = await this.collegeService.findCollege({
      id: collegeId,
    });

    const userIntegrationResponse = new UserIntegrationResponseDto();
    userIntegrationResponse.firstName = lecturer.firstName;
    userIntegrationResponse.misDepartment = department;
    userIntegrationResponse.email = lecturer.email;
    userIntegrationResponse.nationalId = lecturer.nationId;
    userIntegrationResponse.nationality = lecturer.nationality;
    userIntegrationResponse.telephone = lecturer.telephone;
    userIntegrationResponse.misDepartment = department;
    userIntegrationResponse.teachingLevel = lecturer.teachingLevel;
    userIntegrationResponse.isHod = lecturer.isHod;
    userIntegrationResponse.college = college;
    return userIntegrationResponse;
  }

  async findHodByUserId(userId: string) {
    const hod = await this.hodLecturerRepository.findOne({
      where: {
        userId: userId,
      },
    });
    if (!hod)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.HOD_NOT_FOUND);
    return hod;
  }

  async findHod(dto: TeacherLookupDto): Promise<UserIntegrationResponseDto> {
    const staffUser = await this.userService.findByEmailAndNationalId(
      dto.email,
      dto.registrationNumber,
    );
    const hod = await this.findHodByUserId(staffUser.id);

    let department = null;
    let college = null;

    if (hod.departmentId) {
      try {
        department = await this.departmentService.findDepartment({
          id: hod.departmentId,
        });
      } catch (error) {
        department = null;
      }
    }
    if (hod.collegeId) {
      try {
        college = await this.collegeService.findCollege({
          id: hod.collegeId,
        });
      } catch (error) {
        department = null;
      }
    }

    const userIntegrationResponse = new UserIntegrationResponseDto();
    userIntegrationResponse.firstName = staffUser.firstName;
    userIntegrationResponse.lastName = staffUser.lastName;
    userIntegrationResponse.misDepartment = department;
    userIntegrationResponse.email = staffUser.email;
    userIntegrationResponse.nationalId = staffUser.nationalId;
    userIntegrationResponse.nationality = staffUser.nationality;
    userIntegrationResponse.telephone = staffUser.phoneNumber;
    userIntegrationResponse.misDepartment = department;
    userIntegrationResponse.isHod = '1';
    userIntegrationResponse.college = college;

    return userIntegrationResponse;
  }
}
