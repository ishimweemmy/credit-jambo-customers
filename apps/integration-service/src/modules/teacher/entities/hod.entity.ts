import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('hod_lecturers')
export class HodLecturer {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'college_id' })
  collegeId: string;

  @Column({ name: 'department_id' })
  departmentId: string;

  @Column({ name: 'status' })
  status: string;
}
