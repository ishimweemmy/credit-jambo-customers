import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Program } from './entities/program.entity';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Program])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService, GrpcExceptionHandler],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
