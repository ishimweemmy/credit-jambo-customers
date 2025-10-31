import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('rp_student_marks')
export class StudentMarks {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'registration_number' })
  registrationNumber: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  @Column({ name: 'obtained_marks' })
  studentMarks: string;

  @Column({ name: 'academic_year' })
  academicYear: string;

  @Column()
  assignment: string;

  @Column()
  exam: string;

  @Column()
  semester: string;
}
