import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DepartmentsService } from './departments.service';
import {
  DepartmentLookupDto,
  DepartmentResponse,
  DepartmentsResponse,
  Empty,
} from './dto/department-lookup.dto';
import {
  DepartmentGrpcMethods,
  GrpcServices,
} from '@integration-service/common/constants/grpc.constants';
import { DepartmentIntegration } from './entitites/department.entity';

@Controller()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @GrpcMethod(
    GrpcServices.DEPARTMENT_SERVICE,
    DepartmentGrpcMethods.FIND_DEPARTMENT,
  )
  async findDepartment(dto: DepartmentLookupDto): Promise<DepartmentResponse> {
    return this.departmentsService.findDepartment(dto);
  }

  @GrpcMethod(
    GrpcServices.DEPARTMENT_SERVICE,
    DepartmentGrpcMethods.FIND_ALL_DEPARTMENTS,
  )
  async findAllDepartments(dto: Empty): Promise<DepartmentsResponse> {
    return this.departmentsService.findAllDepartments(dto);
  }
  @GrpcMethod(
    GrpcServices.DEPARTMENT_SERVICE,
    DepartmentGrpcMethods.FIND_DEPARTMENT,
  )
  async findTeacher(
    departmentLookupDto: DepartmentLookupDto,
  ): Promise<DepartmentIntegration> {
    return this.departmentsService.findDepartment({
      id: departmentLookupDto.id,
    });
  }
}
