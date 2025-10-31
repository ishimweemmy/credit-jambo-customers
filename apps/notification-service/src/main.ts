import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { NotificationServiceModule } from './notification-service.module';
import { APP_NAME } from './common/constants/all.constants';
import { NotificationConfigService } from './configs/notification-config.service';
import { setUpNotificationConfig, enableGRPC } from './setup';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  setUpNotificationConfig(app);
  enableGRPC(app);

  const port = app.get(NotificationConfigService).port;
  const logger = app.get(Logger);
  await app.startAllMicroservices();
  await app.listen(port, () => {
    logger.log(`${APP_NAME} is running on PORT => ${port} 🎉`);
    logger.log(`${APP_NAME} gRPC is running on PORT => 50052 🚀`);
  });
}
bootstrap();
