import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

export enum AppEnvironment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
}

@Exclude()
export class EnvironmentVariables {
  @Expose()
  @IsEnum(AppEnvironment)
  NODE_ENV: AppEnvironment;

  @Expose()
  @IsNumber()
  INTEGRATION_SERVICE_PORT: number;

  @Expose()
  MYSQL_HOST: string;

  @Expose()
  MYSQL_PORT: number;

  @Expose()
  MYSQL_USER: string;

  @Expose()
  MYSQL_PASSWORD: string;

  @Expose()
  MYSQL_DATABASE: string;

  @Expose()
  LOGBOOK_DATABASE_PASSWORD: string;

  @Expose()
  JWT_SECRET: string;

  @Expose()
  GRPC_HOST: string;

  @Expose()
  GRPC_PORT: number;

  @Expose()
  LOGBOOK_DATABASE: string;

  @Expose()
  LOGBOOK_DATABASE_HOST: string;

  @Expose()
  MIS_DATABASE_HOST: string;

  @Expose()
  MIS_DATABASE_PASSWORD: string;

  @Expose()
  MIS_DATABASE: string;
}
