import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('rp_student_registered')
export class RPRegisteredRegistered {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'student_id' })
  registrationNumber: string;

  @Column({ name: 'academic_year' })
  academicYear: string;

  @Column({ name: 'academic_status' })
  academicStatus: string;

  @Column({ name: 'college_id' })
  college: string;
}
