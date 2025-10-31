import { EUserRole } from '@customer-service/modules/user/enums/user-role.enum';
import { CollegeIntegration } from '@integration-service/modules/college/entities/college.entity';
import { DepartmentIntegration } from '@integration-service/modules/department/entitites/department.entity';
import { IndustrialAttachment } from '@integration-service/modules/industrial-attachment/entities/industrial-attachment.dto';

export class UserIntegrationResponseDto {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  nationality?: string;
  nationalId?: string;
  registrationNumber: string;
  dateOfBirth: string;
  gender: string;
  educationLevel?: string;
  teachingLevel?: string;
  moduleId: string;
  studentMarks: string;
  graduationYear?: string;
  academicYear?: string;
  assignment?: string;
  exam: string;
  semester: string;
  isHod?: string;
  college?: CollegeIntegration;
  misDepartment: DepartmentIntegration;
  industrialAttachments: IndustrialAttachment[];
  role: EUserRole;
}
