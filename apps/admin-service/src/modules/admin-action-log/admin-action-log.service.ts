import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminActionLog, EAdminActionType } from './entities/admin-action-log.entity';

export interface CreateAdminActionLogDto {
  actionType: EAdminActionType;
  adminId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, any>;
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AdminActionLogService {
  constructor(
    @InjectRepository(AdminActionLog)
    private readonly adminActionLogRepository: Repository<AdminActionLog>,
  ) {}

  async logAction(data: CreateAdminActionLogDto): Promise<AdminActionLog> {
    const log = this.adminActionLogRepository.create(data);
    return await this.adminActionLogRepository.save(log);
  }

  async findByAdmin(
    adminId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[AdminActionLog[], number]> {
    return await this.adminActionLogRepository.findAndCount({
      where: { adminId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByTarget(
    targetId: string,
    targetType: string,
  ): Promise<AdminActionLog[]> {
    return await this.adminActionLogRepository.find({
      where: { targetId, targetType },
      order: { createdAt: 'DESC' },
      relations: ['admin'],
    });
  }

  async findByActionType(
    actionType: EAdminActionType,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[AdminActionLog[], number]> {
    return await this.adminActionLogRepository.findAndCount({
      where: { actionType },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}

