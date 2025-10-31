import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('students_supervisors_aip')
export class IndustrialAttachment {
  @PrimaryColumn({ name: 'stud_spv' })
  id: string;
  @Column({ name: 'academic_year' })
  academicYear: string;

  @Column({ name: 'regno' })
  registratinNumber: string;

  @Column({ name: 'company_id' })
  company: string;

  // @Column({ name: 'aip_college_id' })
  // collegeId: string;

  @Column({ name: 'start_date' })
  startDate: string;

  @Column({ name: 'end_date' })
  endDate: string;
}
