import { Test, TestingModule } from '@nestjs/testing';
import { IndustrialAttachmentService } from './industrial-attachment.service';
import { IndustrialAttachment } from './entities/industrial-attachment.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';
import { CompanyIntegrationService } from '../company/company.service';

describe('IndustrialAttachmentService', () => {
  let service: IndustrialAttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndustrialAttachmentService,
        {
          provide: getRepositoryToken(IndustrialAttachment, LOG_BOOK_ROOT_NAME),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: GrpcExceptionHandler,
          useValue: {
            throwGrpcError: jest.fn(),
          },
        },
        {
          provide: CompanyIntegrationService,
          useValue: {
            findCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IndustrialAttachmentService>(
      IndustrialAttachmentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
