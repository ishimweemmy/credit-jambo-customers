import { Controller } from '@nestjs/common';
import { UserIntegrationService } from './user.service';
import {
  GrpcServices,
  UserGrpcMethods,
} from '@integration-service/common/constants/grpc.constants';
import { GrpcMethod } from '@nestjs/microservices';
import { Empty, MISUserResponseDto } from './dto/user-lookup.dto';

@Controller('user')
export class UserIntegrationController {
  constructor(private readonly userIntgrationservice: UserIntegrationService) {}
  @GrpcMethod(
    GrpcServices.USER_INTEGRATION_SERVICE,
    UserGrpcMethods.FIND_ALL_USERS,
  )
  async findAllUsers(dto: { searchKey: string }): Promise<MISUserResponseDto> {
    return this.userIntgrationservice.findAllUsers(dto);
  }
}
