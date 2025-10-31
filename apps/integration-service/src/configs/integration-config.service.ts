import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './dto/env-variables.dto';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class IntegrationConfigService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  get port(): number {
    return this.configService.getOrThrow('INTEGRATION_SERVICE_PORT');
  }

  get environment(): string {
    return this.configService.getOrThrow('NODE_ENV');
  }

  get getMisDbHost(): string {
    return this.configService.getOrThrow('MIS_DATABASE_HOST');
  }

  get dbPort(): number {
    return this.configService.getOrThrow('MYSQL_PORT');
  }

  get dbUser(): string {
    return this.configService.getOrThrow('MYSQL_USER');
  }

  get getMisDbPass(): string {
    return this.configService.getOrThrow('MIS_DATABASE_PASSWORD');
  }

  get getMisDbName(): string {
    return this.configService.getOrThrow('MIS_DATABASE');
  }
  get logbookDbName(): string {
    return this.configService.getOrThrow('LOGBOOK_DATABASE');
  }

  get jwtSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET');
  }

  get GrpcHost(): string {
    return this.configService.getOrThrow('GRPC_HOST');
  }

  get GrpcPort(): number {
    return this.configService.getOrThrow('GRPC_PORT');
  }

  get getLogbookDbPassword(): string {
    return this.configService.getOrThrow('LOGBOOK_DATABASE_PASSWORD');
  }
  get getLogbookDbHost(): string {
    return this.configService.getOrThrow('LOGBOOK_DATABASE_HOST');
  }

  getMysqlInfo(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'mariadb',
      host: this.getMisDbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.getMisDbPass,
      database: this.getMisDbName,
      migrations: ['dist/apps/integration-service/db/migrations/**/*.js'],
      entities: ['dist/apps/integration-service/**/*.{entity.js,dto.js}'],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      cache: false,
      logging: false,
    };
  }

  getLogbookInfo(): TypeOrmModuleOptions {
    return {
      name: 'default',
      type: 'mariadb',
      host: this.getLogbookDbHost,
      port: this.dbPort,
      username: this.dbUser,
      password: this.getLogbookDbPassword,
      database: this.logbookDbName,
      migrations: ['dist/apps/integration-service/db/migrations/**/*.js'],
      entities: ['dist/apps/integration-service/**/*.{entity.js,dto.js}'],
      synchronize: false,
      migrationsRun: false,
      dropSchema: false,
      cache: false,
      logging: false,
    };
  }
}
