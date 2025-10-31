import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MISUser } from './entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { GrpcExceptionHandler } from '@app/common/exceptions/grpc-exceptions.handler';
import { MISUserResponseDto } from './dto/user-lookup.dto';
import { UserIntegrationResponseDto } from '@integration-service/common/dto/user-integration-response.dto';
import { DepartmentsService } from '@integration-service/modules/department/departments.service';
import { CollegeIntegrationService } from '@integration-service/modules/college/college.service';
import { DepartmentIntegration } from '@integration-service/modules/department/entitites/department.entity';
import { STUDENT_MIS_POSITION_ID } from './enums/user.enum';
import { GRPC_ERRORS } from '@app/common/constants/grpc-errors.constants';
@Injectable()
export class UserIntegrationService {
  constructor(
    @InjectRepository(MISUser)
    private readonly misUserRepository: Repository<MISUser>,
    private readonly grpcExceptionHandler: GrpcExceptionHandler,
    private readonly departmentService: DepartmentsService,
    private readonly collegeService: CollegeIntegrationService,
  ) {}

  async findAllUsers(dto: { searchKey: string }): Promise<MISUserResponseDto> {
    const query = this.misUserRepository
      .createQueryBuilder('MISUser')
      .andWhere('MISUser.position <> :position', {
        position: STUDENT_MIS_POSITION_ID,
      });

    if (dto.searchKey) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            'MISUser.firstName LIKE :searchQuery OR MISUser.lastName LIKE :searchQuery OR MISUser.email LIKE :searchQuery OR MISUser.nationalId LIKE :searchQuery',
            { searchQuery: `%${dto.searchKey}%` },
          );
        }),
      );
    }

    const [users, count] = await query.getManyAndCount();

    const usersResponse: UserIntegrationResponseDto[] = [];
    for (const user of users) {
      const integrationUser = new UserIntegrationResponseDto();

      integrationUser.dateOfBirth = user.dateOfBirth;
      integrationUser.firstName = user.firstName;
      integrationUser.lastName = user.lastName;
      integrationUser.email = user.email;
      integrationUser.nationalId = user.nationalId;
      integrationUser.nationality = user.nationality;
      integrationUser.telephone = user.phoneNumber;
      if (user.department) {
        const department = await this.departmentService.findDepartment({
          id: user.department,
        });
        const misDepartment = new DepartmentIntegration();
        misDepartment.departmentCode = department.departmentCode;
        misDepartment.departmentName = department.departmentName;
        misDepartment.type = department.type;
        misDepartment.id = department.id;
        integrationUser.misDepartment = misDepartment;
      }
      if (user.college) {
        const college = await this.collegeService.findCollege({
          id: user.college,
        });
        integrationUser.college = college;
      }
      usersResponse.push(integrationUser);
    }
    const misUserResponse = new MISUserResponseDto();
    misUserResponse.users = usersResponse;
    return misUserResponse;
  }

  async findByEmailAndNationalId(email: string, nationalId: string) {
    const user = await this.misUserRepository.findOne({
      where: {
        email: email,
        // nationalId: nationalId,
        isEnabled: '1',
      },
    });
    if (!user) {
      this.grpcExceptionHandler.throwGrpcError(GRPC_ERRORS.USER_NOT_FOUND);
    }
    return user;
  }
}
