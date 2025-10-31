import { IsNotEmpty } from 'class-validator';

export class TeacherLookupDto {
  @IsNotEmpty()
  registrationNumber: string;

  @IsNotEmpty()
  email: string;
}

export class TeacherByRegistrationIdDto {
  @IsNotEmpty()
  registrationNumber: number;
}
