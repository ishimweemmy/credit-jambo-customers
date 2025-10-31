import { Controller } from '@nestjs/common';
import { IndustrialAttachmentService } from './industrial-attachment.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  GrpcServices,
  IndustrialAttachmentMethods,
} from '@integration-service/common/constants/grpc.constants';
import {
  AttachmentLookup,
  AttachmentResponnse,
} from './dto/attachment-lookup.dto';

@Controller('industrial-attachment')
export class IndustrialAttachmentController {
  constructor(
    private readonly attachmentService: IndustrialAttachmentService,
  ) {}

  @GrpcMethod(
    GrpcServices.INDUSTRIAL_ATTACHMENT_SERVICE,
    IndustrialAttachmentMethods.FIND_ALL_BY_STUDENT,
  )
  async findAllByStudent(dto: AttachmentLookup): Promise<AttachmentResponnse> {
    return this.attachmentService.findAllByStudent(dto);
  }
}
