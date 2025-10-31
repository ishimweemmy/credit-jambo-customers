import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('adm_polytechnics')
export class CollegeIntegration {
  @PrimaryColumn()
  id: string;
  @Column()
  polytechnic: string;
  @Column({ name: 'short_name' })
  shortName: string;
  @Column({ name: 'account_number' })
  accountNumber: string;
  @Column({ name: 'account_title' })
  accountTitle: string;
  @Column()
  email: string;
}
