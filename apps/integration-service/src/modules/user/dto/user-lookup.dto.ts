import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';

export class UserLookupDto {}

export class Empty {}

export class MISUserResponseDto {
  users: UserIntegrationResponseDto[];
}
