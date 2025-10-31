import { Module } from '@nestjs/common';
import { IndustrialAttachmentService } from './industrial-attachment.service';
import { IndustrialAttachmentController } from './industrial-attachment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndustrialAttachment } from './entities/industrial-attachment.dto';
import { LOG_BOOK_ROOT_NAME } from '@integration-service/common/constants/db.constants';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndustrialAttachment], LOG_BOOK_ROOT_NAME),
    CompanyModule,
  ],
  providers: [IndustrialAttachmentService],
  controllers: [IndustrialAttachmentController],
  exports: [IndustrialAttachmentService],
})
export class IndustrialAttachmentModule {}
