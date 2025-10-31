import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('companies')
export class CompanyIntegration {
  @Column({ name: 'id' })
  @PrimaryColumn()
  id: string;

  @Column({ name: 'cmp_name' })
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  sector: string;

  @Column({ name: 'email' })
  @Index({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ name: 'phone' })
  @ApiProperty()
  phone: string;

  @Column({ name: 'specialization' })
  @ApiProperty()
  specialization: string;
}
