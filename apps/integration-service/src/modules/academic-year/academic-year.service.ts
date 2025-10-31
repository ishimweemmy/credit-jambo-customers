import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import { Empty } from '../department/dto/department-lookup.dto';

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
  ) {}

  async findAll() {
    return this.academicYearRepository.find();
  }

  async findCurrentAcademicYear(dto: Empty) {
    return this.academicYearRepository.findOne({
      where: { status: '1' },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
