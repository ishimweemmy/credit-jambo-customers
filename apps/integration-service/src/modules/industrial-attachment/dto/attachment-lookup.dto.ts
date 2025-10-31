import { IndustrialAttachment } from '../entities/industrial-attachment.dto';

export class AttachmentLookup {
  registrationNumber: string;
}

export class AttachmentResponnse {
  attachments: IndustrialAttachment[];
}
