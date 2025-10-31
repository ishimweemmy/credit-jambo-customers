import { Repository } from 'typeorm';
import { SavingsAccount } from '@core-service/modules/savings/entities/savings-account.entity';
import { EAccountStatus } from '@core-service/modules/savings/enums/account-status.enum';

export class SavingsAccountQueries {
  constructor(
    private readonly savingsAccountRepository: Repository<SavingsAccount>,
  ) {}

  async findActiveSavingsAccounts(): Promise<SavingsAccount[]> {
    return this.savingsAccountRepository.find({
      where: { status: EAccountStatus.ACTIVE },
      relations: ['user'],
    });
  }
}
