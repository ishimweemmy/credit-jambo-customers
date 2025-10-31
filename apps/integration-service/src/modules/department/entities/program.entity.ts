import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from './department.entity';

@Entity('rp_programs')
export class Program {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'program_name' })
  programName: string;

  @Column({ name: 'department_id' })
  departmentId: string;

  @Column({ name: 'program_code' })
  programCode: string;

  @ManyToOne(() => Department, (department) => department.programs)
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
