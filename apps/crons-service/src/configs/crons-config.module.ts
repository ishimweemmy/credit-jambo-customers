import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './config-validation';
import { CronsConfigService as CronsConfig } from './crons-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironmentVariables,
      envFilePath: './apps/crons-service/.env',
    }),
  ],
  providers: [ConfigService, CronsConfig],
  exports: [ConfigService, CronsConfig],
})
export class CronsConfigModule {}
