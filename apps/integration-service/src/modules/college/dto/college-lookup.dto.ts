import { ApiProperty } from '@nestjs/swagger';
import { CollegeIntegration } from '../entities/college.entity';
import { CollegeModule } from '../entities/college-module.entity';

export class CollegeLookup {
  id: string;
}

export class GetCollegeLookup {
  id: string;
}

export class Empty {}

export class SearchDto {
  searchKey: string;
}

export class CollegeResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  polytechnic: string;
  @ApiProperty()
  shortName: string;
  @ApiProperty()
  accountNumber: string;
  @ApiProperty()
  email: string;
}

export class CollegesResponse {
  colleges: CollegeIntegration[];
}

export class CollegeModuleResponse {
  id: string;
  collegeId: string;
  yearOfStudy: string;
  moduleCode: string;
  moduleName: string;
  credits: string;
  academicYear: string;
  departmentId: string;
}

export class PaginationDto {
  @ApiProperty({ default: 1 })
  page: number = 1;

  @ApiProperty({ default: 10 })
  limit: number = 10;
}

export class CollegeModulesResponse {
  @ApiProperty()
  modules: CollegeModule[];
}
