import { Test, TestingModule } from '@nestjs/testing';
import { TeacherController } from './teachers.controller';
import { TeacherService } from './teachers.service';
import { TeacherLookupDto } from './dto/teacher-lookup.dto';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';
import { DepartmentsService } from '../department/departments.service';
import { HodLecturer } from './entities/hod.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserIntegrationService } from '../user/user.service';
import { MISUser } from '../user/entities/user.entity';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { CollegeIntegrationService } from '../college/college.service';
import { CollegeIntegration } from '../college/entities/college.entity';
import { CollegeModule } from '../college/entities/college-module.entity';

describe('TeacherController', () => {
  let controller: TeacherController;
  let service: TeacherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherController],
      providers: [
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
          provide: getRepositoryToken(HodLecturer),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: TeacherService,
          useValue: {
            findTeacher: jest.fn(),
          },
        },
        {
          provide: DepartmentsService,
          useValue: {
            findDepartment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TeacherController>(TeacherController);
    service = module.get<TeacherService>(TeacherService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findTeacher', () => {
    it('should return a teacher', async () => {
      const dto: TeacherLookupDto = {
        email: 'john.doe@example.com',
        registrationNumber: '12345',
      };
      const expectedResponse = new UserIntegrationResponseDto();
      expectedResponse.firstName = 'John';
      expectedResponse.lastName = 'Doe';
      expectedResponse.email = 'john.doe@example.com';
      expectedResponse.misDepartment = {
        id: '1',
        departmentName: 'Test Department',
        departmentCode: 'TEST',
        type: 'ACADEMIC',
      };

      jest.spyOn(service, 'findTeacher').mockResolvedValue(expectedResponse);

      const result = await controller.findTeacher(dto);
      expect(result).toEqual(expectedResponse);
      expect(service.findTeacher).toHaveBeenCalledWith({
        email: dto.email,
        registrationNumber: dto.registrationNumber,
      });
    });
  });
});
