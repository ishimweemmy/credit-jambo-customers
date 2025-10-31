import { Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { MinioClientController } from './mnio-client.controller';

@Global()
@Module({
  providers: [MinioClientService, CoreServiceConfigService],
  controllers: [MinioClientController],
  exports: [MinioClientService],
})
export class MinioClientModule {}
