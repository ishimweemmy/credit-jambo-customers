import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StudentMarksLookupDto {
  @IsNotEmpty()
  registrationNumber: string;
}

export class StudentMarksResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  registrationNumber: string;
  @ApiProperty()
  moduleId: string;
  @ApiProperty()
  studentMarks: string;
  @ApiProperty()
  academicYear: string;
  @ApiProperty()
  assignment: string;
  @ApiProperty()
  exam: string;
  @ApiProperty()
  semester: string;
}
export class StudentMarksResponse {
  marks: StudentMarksResponseDto[];
}
