import { Injectable } from '@nestjs/common';
import {
  AttachmentLookup,
  AttachmentResponnse,
} from './dto/attachment-lookup.dto';
import { IndustrialAttachment } from './entities/industrial-attachment.dto';
import { Repository } from 'typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { InjectRepository } from '@nestjs/typeorm';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';
import { CompanyIntegrationService } from '../company/company.service';

@Injectable()
export class IndustrialAttachmentService {
  constructor(
    @InjectRepository(IndustrialAttachment, LOG_BOOK_ROOT_NAME)
    private readonly attachmentRepository: Repository<IndustrialAttachment>,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
    private readonly companyService: CompanyIntegrationService,
  ) {}

  async findAllByStudent({
    registrationNumber,
  }: AttachmentLookup): Promise<AttachmentResponnse> {
    if (!registrationNumber)
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.INVALID_ARGUMENT);

    const attachments = await this.attachmentRepository.find({
      where: { registratinNumber: registrationNumber },
    });
    if (!attachments)
      this.grpcExceptionHandler.throwGrpcError(
        GRPC_ERRORS.NO_INDUSTRIAL_ATTACHMENT_FOUND_FOR_STUDENT,
      );
    const attachmentResponse = new AttachmentResponnse();
    for (const attachment of attachments) {
      const company = await this.companyService.findCompany({
        id: attachment.company,
      });
      attachment.company = company?.name;
    }

    attachmentResponse.attachments = attachments;
    return attachmentResponse;
    //
  }
}
