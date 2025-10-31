import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './config-validation';
import { AdminConfigService } from './admin-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/admin-service/.env',
    }),
  ],
  providers: [ConfigService, AdminConfigService],
  exports: [ConfigService, AdminConfigService],
})
export class AdminConfigModule {}
