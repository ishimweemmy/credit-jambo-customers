import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './validation';
import { IntegrationConfigService } from './integration-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/integration-service/.env',
    }),
  ],
  providers: [ConfigService, IntegrationConfigService],
  exports: [ConfigService, IntegrationConfigService],
})
export class IntegrationConfigModule {}
