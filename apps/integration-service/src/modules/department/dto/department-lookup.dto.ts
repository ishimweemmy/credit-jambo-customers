import { Program } from '../entities/program.entity';

export class DepartmentLookupDto {
  id: string;
}

export class Empty {}

export class ProgramResponse {
  id: string;
  programName: string;
  programCode: string;
  departmentId: string;
}

export class DepartmentResponse {
  id: string;
  departmentName: string;
  departmentCode: string;
  type: string;
  programs: ProgramResponse[];
}

export class DepartmentsResponse {
  departments: DepartmentResponse[];
}
