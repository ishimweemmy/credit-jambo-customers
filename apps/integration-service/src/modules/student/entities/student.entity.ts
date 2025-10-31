import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Transform } from 'class-transformer';
import { EGender } from '@app/common/enums';
import { genderTransformer } from '@integration-service/common/helpers/typeorm.helper';

@Entity('rp_college_students')
export class Student {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'other_names' })
  lastName: string;

  @Column({ name: 'phone' })
  telephone: string;

  @Column({ name: 'student_reg' })
  registrationNumber: string;

  @Column({ name: 'year_of_study' })
  educationLevel: string;

  @Column({ name: 'department_id' })
  departmentId: string;

  @Column({ name: 'college_id' })
  collegeId: string;

  @Column({ name: 'country' })
  nationality: string;

  @Column({ name: 'graduation_year' })
  graduationYear: string;

  @Column({ name: 'year_of_study' })
  yearOfStudy: string;

  @Column({ name: 'gender' })
  @Transform(genderTransformer)
  gender: EGender;

  @Column({ name: 'dob' })
  dateOfBirth: string;
}
