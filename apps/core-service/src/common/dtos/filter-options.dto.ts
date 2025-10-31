// import { EducationLevel } from '@core-service/modules/user/enums/education-level.enum';
import { EUserRole } from '@core-service/modules/user/enums/user-role.enum';

export class FilterOptions {
  searchKeyword: string;
  // educationLevels?: EducationLevel[];
  ownerRole?: EUserRole;
  types?: string[];
  skills?: string[];
  collegeIds?: string[];
  departmentIds?: string[];
}
