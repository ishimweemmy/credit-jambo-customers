import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationService } from './company.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyIntegration } from './entities/company.entity';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';

describe('CompanyService', () => {
  let service: CompanyIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyIntegrationService,
        GrpcExceptionHandler,
        {
          provide: getRepositoryToken(CompanyIntegration, LOG_BOOK_ROOT_NAME),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CompanyIntegrationService>(CompanyIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
