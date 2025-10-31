import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('rp_departments')
export class DepartmentIntegration {
  @PrimaryColumn()
  id: string;
  @Column({ name: 'department_name' })
  departmentName: string;

  @Column({ name: 'department_code' })
  departmentCode: string;

  @Column({ name: 'type' })
  type: string;
}
