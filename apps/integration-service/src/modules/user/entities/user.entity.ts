import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('staff_users')
export class MISUser {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'college_id' })
  college: string;

  @Column({ name: 'department_id' })
  department: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'national_id' })
  nationalId: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: string;

  @Column({ name: 'position_id' })
  position: string;

  @Column({ name: 'gender' })
  gender: string;

  @Column({ name: 'nationality' })
  nationality: string;

  @Column({ name: 'qualification_level' })
  qualificationLevel: string;

  @Column({ name: 'enabled' })
  isEnabled: string;

  @Column({ name: 'qualification' })
  qualification: string;
}
