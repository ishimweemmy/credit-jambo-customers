import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GrpcServices,
  CollegeGrpcMethods,
} from '@integration-service/common/constants/grpc.constants';
import {
  CollegeLookup,
  CollegesResponse,
  Empty,
  CollegeModulesResponse,
} from './dto/college-lookup.dto';
import { CollegeIntegrationService } from './college.service';
import { CollegeIntegration } from './entities/college.entity';

@Controller()
export class CollegeController {
  constructor(private readonly collegeService: CollegeIntegrationService) {}

  @GrpcMethod(GrpcServices.COLLEGE_SERVICE, CollegeGrpcMethods.FIND_COLLEGE)
  async findCollege(
    collegeLookupDto: CollegeLookup,
  ): Promise<CollegeIntegration> {
    return this.collegeService.findCollege(collegeLookupDto);
  }

  @GrpcMethod(
    GrpcServices.COLLEGE_SERVICE,
    CollegeGrpcMethods.FIND_ALL_COLLEGES,
  )
  async findAllColleges(dto: Empty): Promise<CollegesResponse> {
    return this.collegeService.findAllColleges(dto);
  }

  @GrpcMethod(
    GrpcServices.COLLEGE_SERVICE,
    CollegeGrpcMethods.FIND_COLLEGE_MODULES,
  )
  async findCollegeModules(
    dto: CollegeLookup,
  ): Promise<CollegeModulesResponse> {
    return this.collegeService.findCollegeModules(dto);
  }

  @GrpcMethod(
    GrpcServices.COLLEGE_SERVICE,
    CollegeGrpcMethods.FIND_COLLEGE_MODULES_BY_DEPARTMENT,
  )
  async findCollegeModulesByDepartment(dto: {
    departmentName: string;
    collegeName: string;
    page?: string;
    limit?: string;
    searchKeyword?: string;
  }): Promise<CollegeModulesResponse> {
    return this.collegeService.findCollegeModulesByDepartment({
      departmentName: dto.departmentName,
      collegeName: dto.collegeName,
      page: dto.page,
      limit: dto.limit,
      searchKeyword: dto.searchKeyword,
    });
  }
}
