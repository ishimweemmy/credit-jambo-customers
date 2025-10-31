import { CollegeIntegration } from '@integration-service/modules/college/entities/college.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('graduate_certificates')
export class Graduate {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'reg_number' })
  registrationNumber: string;
  department: string;

  @Column({ name: 'familyName' })
  firstName: string;

  @Column({ name: 'otherNames' })
  lastName: string;

  @Column({ name: 'graduationDate' })
  graduationDate: string;

  @ApiProperty()
  academicYear: string;

  @ApiProperty()
  academicStatus: string;

  @ApiProperty()
  misCollege: CollegeIntegration;
}
