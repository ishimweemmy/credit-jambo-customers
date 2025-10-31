import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeacherService } from './teachers.service';
import { Teacher } from './entities/techer.entity';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { TeacherLookupDto } from './dto/teacher-lookup.dto';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';
import { DepartmentsService } from '../department/departments.service';
import { CollegeIntegrationService } from '../college/college.service';
import { HodLecturer } from './entities/hod.entity';
import { UserIntegrationService } from '../user/user.service';
import { MISUser } from '../user/entities/user.entity';
import { CollegeIntegration } from '../college/entities/college.entity';
import { CollegeModule } from '../college/entities/college-module.entity';

describe('TeacherService', () => {
  let service: TeacherService;
  let teacherRepository: any;
  let grpcExceptionHandler: any;
  let departmentsService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        UserIntegrationService,
        GrpcExceptionHandler,
        CollegeIntegrationService,
        DepartmentsService,
        {
          provide: getRepositoryToken(MISUser),
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
          provide: getRepositoryToken(CollegeIntegration),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HodLecturer),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Teacher),
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
          },
        },
        {
          provide: CollegeIntegrationService,
          useValue: {
            findCollegeModulesByDepartment: jest.fn(),
            findCollege: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
    teacherRepository = module.get(getRepositoryToken(Teacher));
    grpcExceptionHandler = module.get(GrpcExceptionHandler);
    departmentsService = module.get(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findTeacher', () => {
    it('should return a teacher by email and registration number', async () => {
      const mockTeacher = {
        id: '1',
        firstName: 'John Doe',
        email: 'john.doe@example.com',
        nationId: '12345',
        nationality: 'Rwandan',
        telephone: '1234567890',
        departmentId: '1',
        department: {
          id: '1',
          departmentName: 'Test Department',
          departmentCode: 'TEST',
          type: 'ACADEMIC',
        },
      };

      teacherRepository.findOne.mockResolvedValue(mockTeacher);
      departmentsService.findDepartment.mockResolvedValue(
        mockTeacher.department,
      );

      const result = await service.findTeacher({
        email: 'john.doe@example.com',
        registrationNumber: '12345',
      });

      expect(result).toBeInstanceOf(UserIntegrationResponseDto);
      expect(result.firstName).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.nationalId).toBe('12345');
      expect(result.nationality).toBe('Rwandan');
      expect(result.telephone).toBe('1234567890');
      expect(result.misDepartment).toBeDefined();
      expect(teacherRepository.findOne).toHaveBeenCalledWith({
        where: {
          nationId: '12345',
          email: 'john.doe@example.com',
        },
        relations: ['department'],
      });
    });

    it('should throw error if teacher not found', async () => {
      teacherRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findTeacher({
          email: 'john.doe@example.com',
          registrationNumber: '12345',
        }),
      ).rejects.toThrow();
      expect(grpcExceptionHandler.throwGrpcError).toHaveBeenCalled();
    });
  });
});
