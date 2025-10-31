import { EGender } from '@app/common/enums';
import { EStudentStatus } from '@integration-service/modules/student/enums/student-status.enum';
import { TransformFnParams } from 'class-transformer';

export const genderTransformer = ({ value }: TransformFnParams) => {
  if (!value) return EGender.UNKNOWN;
  if (value === '1') return EGender.UNKNOWN;
  if (value === 'Male') return EGender.MALE;
  if (value === 'Female') return EGender.FEMALE;
  return EGender.UNKNOWN;
};

export const studentStatusTransformer = ({ value }: TransformFnParams) => {
  if (!value || value === '') return EStudentStatus.UNKNOWN;
  if (value === 'active') return EStudentStatus.ACTIVE;
  if (value === 'alumni') return EStudentStatus.ALUMNI;
  return EStudentStatus.UNKNOWN;
};
