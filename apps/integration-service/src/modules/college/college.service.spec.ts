import { Test, TestingModule } from '@nestjs/testing';
import { CollegeIntegrationService } from './college.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollegeIntegration } from './entities/college.entity';
import { CollegeModule } from './entities/college-module.entity';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { DepartmentsService } from '../department/departments.service';

describe('CollegeService', () => {
  let service: CollegeIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollegeIntegrationService,
        GrpcExceptionHandler,
        {
          provide: getRepositoryToken(CollegeIntegration),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CollegeModule),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: ExceptionHandler,
          useValue: {},
        },
        {
          provide: DepartmentsService,
          useValue: {
            findDepartment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CollegeIntegrationService>(CollegeIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
