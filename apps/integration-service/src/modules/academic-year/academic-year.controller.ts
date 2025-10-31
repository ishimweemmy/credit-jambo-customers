import { Controller, Get } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AcademicYearGrpcMethods,
  GrpcServices,
} from '@integration-service/common/constants/grpc.constants';
import { Empty } from '../college/dto/college-lookup.dto';

@Controller('academic-year')
export class AcademicYearController {
  constructor(private readonly academicYearService: AcademicYearService) {}

  @Get('current')
  @GrpcMethod(
    GrpcServices.ACADEMIC_YEAR_SERVICE,
    AcademicYearGrpcMethods.FIND_CURRENT_ACADEMIC_YEAR,
  )
  async findCurrentAcademicYear(dto: Empty) {
    return this.academicYearService.findCurrentAcademicYear(dto);
  }
}
