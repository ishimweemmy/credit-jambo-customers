import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { CoreServiceConfigModule } from '@core-service/configs/core-service-config.module';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { AuthGuard } from '@core-service/guards/auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [CoreServiceConfigModule],
      inject: [CoreServiceConfigService],
      useFactory: async (configService: CoreServiceConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: {
          expiresIn: configService.jwtExpiresIn,
        },
      }),
    }),
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
