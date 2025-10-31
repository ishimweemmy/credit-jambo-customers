import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AdminConfigService } from '../../configs/admin-config.service';
import { AdminConfigModule } from '../../configs/admin-config.module';
import { NotificationGrpcService } from './notification-grpc.service';

export const NOTIFICATION_GRPC_PACKAGE = 'notification';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_GRPC_PACKAGE,
        imports: [AdminConfigModule],
        inject: [AdminConfigService],
        useFactory: (configService: AdminConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'notification',
            protoPath: join(process.cwd(), 'assets/proto/notification.proto'),
            url: configService.notificationGrpcUrl,
          },
        }),
      },
    ]),
  ],
  providers: [NotificationGrpcService],
  exports: [ClientsModule, NotificationGrpcService],
})
export class NotificationGrpcModule {}

