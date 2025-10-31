import { NestFactory } from '@nestjs/core';
import { IntegrationServiceModule } from './integration.module';
import { Logger } from 'nestjs-pino';
import { IntegrationConfigService } from './configs/integration-config.service';
import { setupIntegrationConfig } from './setup';
import { APP_NAME } from './common/constants/all.constants';

async function bootstrap() {
  const app = await NestFactory.create(IntegrationServiceModule);

  await setupIntegrationConfig(app);

  await app.startAllMicroservices();

  const port = app.get(IntegrationConfigService).port;
  const logger = app.get(Logger);
  await app.listen(port, () => {
    logger.log(`${APP_NAME} Rest is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
