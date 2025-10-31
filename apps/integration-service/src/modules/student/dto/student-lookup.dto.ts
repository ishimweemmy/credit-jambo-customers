import { IsNotEmpty } from 'class-validator';

export class StudentLookupDto {
  @IsNotEmpty()
  registrationNumber: string;

  @IsNotEmpty()
  email: string;
}

export class StudentByRegistrationNumberDto {
  @IsNotEmpty()
  registrationNumber: string;
}

export class GraduateLookup {
  @IsNotEmpty()
  registrationNumber: string;
}
