import { IsNotEmpty } from 'class-validator';

export class DepartmentLookupDto {
  @IsNotEmpty()
  id: string;
}
