import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('college_modules')
export class CollegeModule {
  @PrimaryColumn()
  id: string;
  @Column({ name: 'college_id' })
  collegeId: string;
  @Column({ name: 'year_of_study' })
  yearOfStudy: string;
  @Column({ name: 'module_code' })
  moduleCode: string;
  @Column({ name: 'module_name' })
  moduleName: string;
  @Column()
  credits: string;
  @Column({ name: 'academic_year' })
  academicYear: string;
  @Column({ name: 'department_id' })
  departmentId: string;
}
