import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GrpcServices,
  CollegeGrpcMethods,
  CompanyGrpcMethods,
} from '@integration-service/common/constants/grpc.constants';
import { CompanyIntegrationService } from './company.service';
import { CompaniesResponse, CompanyLookupDto } from './dto/company-lookup.dto';
import { CompanyIntegration } from './entities/company.entity';
import { SearchDto } from '../college/dto/college-lookup.dto';

@Controller()
export class CompanyIntegrationController {
  constructor(private readonly companyService: CompanyIntegrationService) {}

  @GrpcMethod(GrpcServices.COLLEGE_SERVICE, CollegeGrpcMethods.FIND_COLLEGE)
  async findCollege(
    collegeLookupDto: CompanyLookupDto,
  ): Promise<CompanyIntegration> {
    return this.companyService.findCompany(collegeLookupDto);
  }

  @GrpcMethod(
    GrpcServices.COMPANY_SERVICE,
    CompanyGrpcMethods.FIND_ALL_COMPANIES,
  )
  async findAllCompanies(dto: SearchDto): Promise<CompaniesResponse> {
    return this.companyService.findAllCompanies(dto);
  }
}
