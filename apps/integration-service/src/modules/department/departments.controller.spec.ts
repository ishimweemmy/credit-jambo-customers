import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentLookupDto } from './dto/department-lookup.dto';
import { DepartmentIntegration } from './entitites/department.entity';
import {
  DepartmentResponse,
  DepartmentsResponse,
} from './dto/department-lookup.dto';
import { Empty } from './dto/department-lookup.dto';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: DepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentsService,
          useValue: {
            findDepartment: jest.fn(),
            findAllDepartments: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findDepartment', () => {
    it('should return a department', async () => {
      const dto: DepartmentLookupDto = { id: '1' };
      const expectedResponse = new DepartmentResponse();
      expectedResponse.id = '1';
      expectedResponse.departmentName = 'Test Department';
      expectedResponse.departmentCode = 'TEST';
      expectedResponse.type = 'ACADEMIC';

      jest.spyOn(service, 'findDepartment').mockResolvedValue(expectedResponse);

      const result = await controller.findDepartment(dto);
      expect(result).toEqual(expectedResponse);
      expect(service.findDepartment).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllDepartments', () => {
    it('should return all departments', async () => {
      const dto: Empty = {};
      const expectedResponse = new DepartmentsResponse();
      expectedResponse.departments = [
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

      jest
        .spyOn(service, 'findAllDepartments')
        .mockResolvedValue(expectedResponse);

      const result = await controller.findAllDepartments(dto);
      expect(result).toEqual(expectedResponse);
      expect(service.findAllDepartments).toHaveBeenCalledWith(dto);
    });
  });
});
