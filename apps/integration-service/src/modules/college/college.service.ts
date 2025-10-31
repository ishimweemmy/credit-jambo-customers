import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
import * as _ from 'lodash';
import {
  CollegeLookup,
  CollegesResponse,
  Empty,
  CollegeModulesResponse,
  CollegeModuleResponse,
} from './dto/college-lookup.dto';
import { CollegeIntegration } from './entities/college.entity';
import { CollegeModule } from './entities/college-module.entity';
import { DepartmentsService } from '../department/departments.service';
import { AcademicYearService } from '../academic-year/academic-year.service';

@Injectable()
export class CollegeIntegrationService {
  constructor(
    @InjectRepository(CollegeIntegration)
    private readonly collegeRepository: Repository<CollegeIntegration>,
    @InjectRepository(CollegeModule)
    private readonly collegeModuleRepository: Repository<CollegeModule>,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
    private readonly departmentService: DepartmentsService,
    private readonly academicYearService: AcademicYearService,
  ) {}

  async findAllColleges(dto: Empty): Promise<CollegesResponse> {
    const colleges = await this.collegeRepository.find({});
    const response = new CollegesResponse();
    response.colleges = colleges;
    return response;
  }

  async findCollege({ id }: CollegeLookup): Promise<CollegeIntegration> {
    if (!id)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);

    const college = await this.collegeRepository.findOne({
      where: { id: id },
    });
    if (!college)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.COLLEGE_NOT_FOUND);
    return college;
  }

  async findCollegeModules({
    id,
  }: CollegeLookup): Promise<CollegeModulesResponse> {
    if (!id) {
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);
    }
    const modules = await this.collegeModuleRepository.find({
      where: { collegeId: id },
    });

    const moduleResponses: CollegeModuleResponse[] = modules.map((module) => ({
      id: module.id,
      collegeId: module.collegeId,
      yearOfStudy: module.yearOfStudy,
      moduleCode: module.moduleCode,
      moduleName: module.moduleName,
      credits: module.credits,
      academicYear: module.academicYear,
      departmentId: module.departmentId,
    }));

    const response = new CollegeModulesResponse();
    response.modules = moduleResponses;
    return response;
  }

  async findCollegeModulesByDepartment(dto: {
    departmentName: string;
    collegeName: string;
    page?: string;
    limit?: string;
    searchKeyword?: string;
  }) {
    const department = await this.departmentService.findByName(
      dto.departmentName,
    );
    const college = await this.collegeRepository.findOne({
      where: { polytechnic: dto.collegeName },
    });

    const page = dto.page ? parseInt(dto.page, 10) : 1;
    const limit = dto.limit ? parseInt(dto.limit, 10) : 10;
    const skip = (page - 1) * limit;
    const currentAcademicYear =
      await this.academicYearService.findCurrentAcademicYear({});

    const collegeModulesQuery =
      this.collegeModuleRepository.createQueryBuilder('CollegeModule');
    // if(department) {
    //   collegeModulesQuery.andWhere('CollegeModule.departmentId = :departmentId', { departmentId: department.id });
    // }
    if (college) {
      collegeModulesQuery.andWhere('CollegeModule.collegeId = :collegeId', {
        collegeId: college.id,
      });
    }
    if (dto.searchKeyword) {
      collegeModulesQuery.andWhere(
        'LOWER(CollegeModule.moduleName) LIKE LOWER(:searchKeyword)',
        {
          searchKeyword: `%${dto.searchKeyword}%`,
        },
      );
    }
    if (currentAcademicYear?.name) {
      collegeModulesQuery.andWhere(
        'CollegeModule.academicYear = :academicYear',
        { academicYear: currentAcademicYear?.name },
      );
    }

    // collegeModulesQuery.skip(skip).take(limit);

    const [collegeModulesFromDb, totalFromDb] =
      await collegeModulesQuery.getManyAndCount();

    // Remove duplicates based on all fields except id
    const uniqueModules = _.uniqBy(
      collegeModulesFromDb,
      (module) =>
        `${module.collegeId}-${module.yearOfStudy}-${module.moduleCode}-${module.moduleName}-${module.credits}-${module.academicYear}-${module.departmentId}`,
    );

    const response = new CollegeModulesResponse();
    response.modules = uniqueModules;
    // response.total = totalFromDb;
    // response.page = page;
    // response.limit = limit;
    // response.totalPages = Math.ceil(totalFromDb / limit);
    return response;
  }
}
