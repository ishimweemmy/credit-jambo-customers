import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { Program } from './entities/program.entity';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { DepartmentLookupDto } from './dto/department-lookup.dto';
import {
  DepartmentResponse,
  DepartmentsResponse,
} from './dto/department-lookup.dto';
import { Empty } from './dto/department-lookup.dto';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let departmentRepository: any;
  let programRepository: any;
  let grpcExceptionHandler: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
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
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    departmentRepository = module.get(getRepositoryToken(Department));
    programRepository = module.get(getRepositoryToken(Program));
    grpcExceptionHandler = module.get(GrpcExceptionHandler);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllDepartments', () => {
    it('should return all departments', async () => {
      const mockDepartments = [
        {
          id: '1',
          departmentName: 'Test Department 1',
          departmentCode: 'TEST1',
          type: 'ACADEMIC',
          programs: [],
        },
        {
          id: '2',
          departmentName: 'Test Department 2',
          departmentCode: 'TEST2',
          type: 'ACADEMIC',
          programs: [],
        },
      ];

      departmentRepository.find.mockResolvedValue(mockDepartments);

      const result = await service.findAllDepartments({} as Empty);

      expect(result).toBeInstanceOf(DepartmentsResponse);
      expect(result.departments).toHaveLength(2);
      expect(result.departments[0].id).toBe('1');
      expect(result.departments[1].id).toBe('2');
      expect(departmentRepository.find).toHaveBeenCalledWith({
        relations: ['programs'],
      });
    });
  });

  describe('findDepartment', () => {
    it('should return a department by id', async () => {
      const mockDepartment = {
        id: '1',
        departmentName: 'Test Department',
        departmentCode: 'TEST',
        type: 'ACADEMIC',
        programs: [],
      };

      departmentRepository.findOne.mockResolvedValue(mockDepartment);

      const result = await service.findDepartment({ id: '1' });

      expect(result).toBeInstanceOf(DepartmentResponse);
      expect(result.id).toBe('1');
      expect(result.departmentName).toBe('Test Department');
      expect(departmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['programs'],
      });
    });

    it('should throw error if department not found', async () => {
      departmentRepository.findOne.mockResolvedValue(null);

      await expect(service.findDepartment({ id: '1' })).rejects.toThrow();
      expect(grpcExceptionHandler.throwGrpcError).toHaveBeenCalled();
    });

    it('should throw error if id is not provided', async () => {
      await expect(service.findDepartment({ id: '' })).rejects.toThrow();
      expect(grpcExceptionHandler.throwGrpcError).toHaveBeenCalled();
    });
  });
});
