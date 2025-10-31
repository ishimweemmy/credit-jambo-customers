import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationController } from './company.controller';
import { CompanyIntegrationService } from './company.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyIntegration } from './entities/company.entity';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';

describe('CompanyController', () => {
  let controller: CompanyIntegrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyIntegrationController],
      providers: [
        CompanyIntegrationService,
        GrpcExceptionHandler,
        {
          provide: getRepositoryToken(CompanyIntegration, LOG_BOOK_ROOT_NAME),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CompanyIntegrationController>(
      CompanyIntegrationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
