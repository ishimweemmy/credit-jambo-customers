import { NestFactory } from '@nestjs/core';
import { AdminServiceModule } from './admin-service.module';
import { setupAdminConfig } from './setup';
import { AdminConfigService } from './configs/admin-config.service';
import { Logger } from 'nestjs-pino';
import { APP_NAME } from './common/constants/all.constants';
import { install } from 'source-map-support';
install();

async function bootstrap() {
  const app = await NestFactory.create(AdminServiceModule);

  await setupAdminConfig(app);

  const port = app.get(AdminConfigService).port;
  const logger = app.get(Logger);

  await app.listen(port, () => {
    logger.log(`${APP_NAME} is running on PORT => ${port} 🎉`);
  });
}
bootstrap();
