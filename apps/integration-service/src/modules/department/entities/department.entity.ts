import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { Program } from './program.entity';

@Entity('rp_departments')
export class Department {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'department_name' })
  departmentName: string;

  @Column({ name: 'department_code' })
  departmentCode: string;

  @Column()
  type: string;

  @OneToMany(() => Program, (program) => program.department)
  programs: Program[];
}
