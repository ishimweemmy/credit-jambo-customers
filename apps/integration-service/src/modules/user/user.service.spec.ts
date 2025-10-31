import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserIntegrationService } from './user.service';
import { MISUser } from './entities/user.entity';
import { Department } from '../department/entities/department.entity';
import { Program } from '../department/entities/program.entity';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { DepartmentsService } from '../department/departments.service';
import { CollegeIntegrationService } from '../college/college.service';

describe('UserService', () => {
  let service: UserIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserIntegrationService,
        {
          provide: getRepositoryToken(MISUser),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Program),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: GrpcExceptionHandler,
          useValue: {
            throwGrpcError: jest.fn(),
          },
        },
        {
          provide: DepartmentsService,
          useValue: {
            findDepartment: jest.fn(),
            findAllDepartments: jest.fn(),
          },
        },
        {
          provide: CollegeIntegrationService,
          useValue: {
            findCollege: jest.fn(),
            findAllColleges: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserIntegrationService>(UserIntegrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
