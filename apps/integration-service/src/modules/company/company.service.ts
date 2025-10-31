import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
import { SearchDto } from '../college/dto/college-lookup.dto';
import { CompaniesResponse, CompanyLookupDto } from './dto/company-lookup.dto';
import { CompanyIntegration } from './entities/company.entity';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';

@Injectable()
export class CompanyIntegrationService {
  constructor(
    @InjectRepository(CompanyIntegration, LOG_BOOK_ROOT_NAME)
    private readonly companyRepository: Repository<CompanyIntegration>,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
  ) {}

  async findAllCompanies(dto: SearchDto): Promise<CompaniesResponse> {
    const query = this.companyRepository
      .createQueryBuilder('company')
      .andWhere('company.name LIKE :search', {
        search: `%${dto.searchKey}%`,
      });
    const companies = await query.getMany();
    const response = new CompaniesResponse();
    response.companies = companies;
    return response;
  }

  async findCompany({ id }: CompanyLookupDto): Promise<CompanyIntegration> {
    if (!id)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);

    const college = await this.companyRepository.findOne({
      where: { id: id },
    });
    if (!college)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.COLLEGE_NOT_FOUND);
    return college;
  }
}
