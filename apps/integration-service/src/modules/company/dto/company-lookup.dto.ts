import { ApiProperty } from '@nestjs/swagger';
import { CompanyIntegration } from '../entities/company.entity';

export class CompanyLookupDto {
  id: string;
}
export class CompanyResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  sector: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone: string;
}

export class CompaniesResponse {
  companies: CompanyIntegration[];
}
