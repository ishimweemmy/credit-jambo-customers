import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GrpcServices,
  TeacherGrpcMethods,
} from '@integration-service/common/constants/grpc.constants';
import { TeacherService } from './teachers.service';
import { TeacherLookupDto } from './dto/teacher-lookup.dto';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @GrpcMethod(
    GrpcServices.LECTURE_SERVICE,
    TeacherGrpcMethods.FIND_LECTURE_BY_CODE_OR_EMAIL,
  )
  async findTeacher(
    teacherLookUp: TeacherLookupDto,
  ): Promise<UserIntegrationResponseDto> {
    return this.teacherService.findTeacher({
      email: teacherLookUp.email,
      registrationNumber: teacherLookUp.registrationNumber,
    });
  }
  @GrpcMethod(GrpcServices.LECTURE_SERVICE, TeacherGrpcMethods.FIND_HOD)
  async findHod(
    teacherLookUp: TeacherLookupDto,
  ): Promise<UserIntegrationResponseDto> {
    return this.teacherService.findHod({
      email: teacherLookUp.email,
      registrationNumber: teacherLookUp.registrationNumber,
    });
  }
}
