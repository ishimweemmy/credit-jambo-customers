import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
import { Department } from './entities/department.entity';
import { Program } from './entities/program.entity';
import {
  DepartmentLookupDto,
  DepartmentResponse,
  DepartmentsResponse,
  Empty,
} from './dto/department-lookup.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
  ) {}

  async findAllDepartments(dto: Empty): Promise<DepartmentsResponse> {
    const departments = await this.departmentRepository.find({
      relations: ['programs'],
    });

    const response = new DepartmentsResponse();
    response.departments = departments.map((department) => {
      const deptResponse = new DepartmentResponse();
      deptResponse.id = department.id;
      deptResponse.departmentName = department.departmentName;
      deptResponse.departmentCode = department.departmentCode;
      deptResponse.type = department.type;
      deptResponse.programs = department.programs;
      return deptResponse;
    });
    return response;
  }

  async findByName(name: string) {
    const department = await this.departmentRepository.findOne({
      where: { departmentName: name },
    });
    if (!department)
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.DEPARTMENT_NOT_FOUND,
      );
    return department;
  }

  async findDepartment({
    id,
  }: DepartmentLookupDto): Promise<DepartmentResponse> {
    if (!id) {
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);
    }

    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['programs'],
    });

    if (!department) {
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.DEPARTMENT_NOT_FOUND,
      );
    }

    const response = new DepartmentResponse();
    response.id = department.id;
    response.departmentName = department.departmentName;
    response.departmentCode = department.departmentCode;
    response.type = department.type;
    response.programs = department.programs;
    return response;
  }
}
