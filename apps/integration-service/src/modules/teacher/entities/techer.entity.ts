import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from '../../department/entities/department.entity';

@Entity('lecturers')
export class Teacher {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', name: 'college_id', length: 191 })
  college: string;

  @Column({
    type: 'bigint',
    name: 'teaching_level_id',
    unsigned: true,
    nullable: true,
  })
  teachingLevel: string;

  @Column({ type: 'varchar', name: 'name', length: 191 })
  firstName: string;

  @Column({ type: 'varchar', length: 191, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 191, nullable: true, unique: true })
  telephone: string;

  @Column({
    type: 'varchar',
    name: 'nationID',
    length: 191,
    nullable: true,
    unique: true,
  })
  nationId: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  address: string;

  @Column()
  gender: string;

  @Column({ type: 'varchar', length: 191 })
  password: string;

  @Column()
  nationality: string;

  @Column()
  position: string;

  @Column({ type: 'tinyint', name: 'is_head_of_department' })
  isHod: string;

  @Column({ name: 'department', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department' })
  department: Department;
}
