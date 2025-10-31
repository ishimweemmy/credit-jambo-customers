import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('active_academic_years')
export class AcademicYear {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'academic_year' })
  name: string;

  @Column({ name: 'status' })
  status: string;
}
