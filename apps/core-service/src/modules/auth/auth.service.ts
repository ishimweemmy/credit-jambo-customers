import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDTO } from './dto/login.dto';
import { ExceptionHandler } from '@app/common/exceptions/exceptions.handler';
import { _400, _401 } from '@app/common/constants/errors-constants';
import { EUserStatus } from '../user/enums/user-status.enum';
import { EKYCStatus } from '../user/enums/kyc-status.enum';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { BrainService } from '@app/common/brain/brain.service';
import { plainToClass } from 'class-transformer';
import {
  FAILED_LOGIN_ATTEMPT,
  REFRESH_TOKEN_CACHE,
  RESET_PASSWORD_CACHE,
} from '@core-service/common/constants/brain.constants';
import {
  FAILED_LOGIN_ATTEMPTS_TO_SEND_NOTIFICATION,
  MAX_FAILED_ATTEMPTS,
} from '@core-service/common/constants/all.constants';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { ENotificationMessageType } from '@app/common/enums/notification-message-type.enum';
import { NotificationPreProcessor } from '@core-service/integrations/notification/notification.preprocessor';
import { EmailTemplates } from '@core-service/configs/email-template-configs/email-templates.config';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly config: CoreServiceConfigService,
    private readonly jwt: JwtService,
    private readonly exceptionHandler: ExceptionHandler,
    private readonly brainService: BrainService,
    private readonly notificationProcessor: NotificationPreProcessor,
  ) {}

  /**
   * Login for Credit Jambo customers
   * Validates credentials and returns JWT token
   */
  async login(dto: LoginDTO) {
    const userExists = await this.userService.existByEmail(dto.email);
    if (!userExists) {
      this.exceptionHandler.throwUnauthorized(_400.USER_NOT_ONBOARDED);
    }

    const user: User = await this.userService.findByEmail(dto.email);
    const key = `${FAILED_LOGIN_ATTEMPT.name}:${user.email}`;
    const failedAttempts = await this.brainService.remindMe<number>(key);

    if (failedAttempts !== null && failedAttempts >= MAX_FAILED_ATTEMPTS) {
      this.exceptionHandler.throwUnauthorized(
        _401.ACCOUNT_LOCKED_FOR_LOGIN_ATTEMPTS,
      );
    }

    // Verify password
    const passwordsMatch = await bcrypt.compare(
      dto.password.toString(),
      user.password.toString(),
    );

    if (!passwordsMatch) {
      await this.handleFailedLoginAttempt(user, key, failedAttempts);
      throw this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }

    // Check if account is active
    if (user.status === EUserStatus.INACTIVE) {
      this.exceptionHandler.throwUnauthorized(_401.ACCOUNT_NOT_VERIFIED);
    }

    return await this.handleSuccessfulLogin(user);
  }

  /**
   * Verify email with OTP for account activation
   * Also marks KYC as verified (email verification = basic KYC)
   */
  async verifyEmail(email: string, otp: number): Promise<User> {
    const user = await this.userService.findByEmail(email);
    const isOtpValid = await this.verifyOTP(user.id, otp);

    if (!isOtpValid) {
      this.exceptionHandler.throwBadRequest(_400.INVALID_OTP);
    }

    user.status = EUserStatus.ACTIVE;
    user.kycStatus = EKYCStatus.VERIFIED;
    user.kycVerifiedAt = new Date();
    return await this.userService.saveUser(user);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = await this.jwt.verifyAsync<{
        id: string;
        tokenId: string;
      }>(refreshToken, { secret: this.config.jwtRefreshSecret });

      const key = `${REFRESH_TOKEN_CACHE.name}:${decoded.id}:${decoded.tokenId}`;
      const storedToken = await this.brainService.remindMe<string>(key);

      if (!storedToken || storedToken !== refreshToken) {
        this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
      }

      const user = await this.userService.findById(decoded.id);

      // Delete old refresh token (rotation)
      await this.brainService.forget(key);

      // Generate new tokens
      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.getToken(user),
        this.generateRefreshToken(user),
      ]);

      return {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: plainToClass(User, user),
      };
    } catch (error) {
      this.exceptionHandler.throwUnauthorized(_401.INVALID_CREDENTIALS);
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = await this.jwt.verifyAsync<{
        id: string;
        tokenId: string;
      }>(refreshToken, { secret: this.config.jwtRefreshSecret });

      const key = `${REFRESH_TOKEN_CACHE.name}:${decoded.id}:${decoded.tokenId}`;
      await this.brainService.forget(key);
    } catch (error) {
      // Silently fail if token already invalid
    }
  }

  /**
   * Send OTP for email verification
   */
  async sendVerificationOTP(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);
    await this.brainService.forget(user.id);
    const otp = await this.brainService.generateOTP(user.id);
    await this.brainService.memorize(user.id, otp, RESET_PASSWORD_CACHE.ttl);

    // Send OTP email using customer registration template
    await this.notificationProcessor.sendTemplateEmail(
      EmailTemplates.CUSTOMER_REGISTRATION,
      [email],
      {
        firstName: user.firstName,
        lastName: user.lastName,
        customerId: user.customerId,
        email: user.email,
        otp: otp.toString(),
      },
    );
  }

  /**
   * Generate JWT access token for authenticated user
   */
  private async getToken(user: User): Promise<string> {
    return await this.jwt.signAsync(
      {
        role: user.role,
        id: user.id,
        customerId: user.customerId,
      },
      {
        expiresIn: this.config.jwtExpiresIn,
        secret: this.config.jwtSecret,
      },
    );
  }

  /**
   * Generate refresh token and store in Redis
   */
  private async generateRefreshToken(user: User): Promise<string> {
    const tokenId = crypto.randomUUID();
    const refreshToken = await this.jwt.signAsync(
      {
        id: user.id,
        tokenId,
      },
      {
        expiresIn: this.config.jwtRefreshExpiresIn,
        secret: this.config.jwtRefreshSecret,
      },
    );

    const key = `${REFRESH_TOKEN_CACHE.name}:${user.id}:${tokenId}`;
    await this.brainService.memorize(
      key,
      refreshToken,
      REFRESH_TOKEN_CACHE.ttl,
    );

    return refreshToken;
  }

  /**
   * Verify OTP stored in Redis
   */
  private async verifyOTP(userId: string, otp: number): Promise<boolean> {
    const key = `${RESET_PASSWORD_CACHE.name}:${userId}`;
    const storedOTP = await this.brainService.remindMe<number>(key);

    if (!storedOTP || storedOTP !== otp) {
      return false;
    }
    await this.brainService.forget(key);
    return true;
  }

  /**
   * Handle failed login attempt
   */
  private async handleFailedLogin(
    key: string,
    failedAttempts: number,
  ): Promise<void> {
    if (failedAttempts === null) {
      await this.brainService.memorize(key, 1, FAILED_LOGIN_ATTEMPT.ttl);
    } else {
      await this.brainService.memorize(
        key,
        failedAttempts + 1,
        FAILED_LOGIN_ATTEMPT.ttl,
      );
    }
  }

  /**
   * Handle successful login
   */
  private async handleSuccessfulLogin(user: User) {
    user.lastLogin = new Date();

    const [token, refreshToken, savedUser] = await Promise.all([
      this.getToken(user),
      this.generateRefreshToken(user),
      this.userService.saveUser(user),
    ]);

    return { token, refreshToken, user: plainToClass(User, savedUser) };
  }

  /**
   * Handle failed login attempt with notification
   */
  private async handleFailedLoginAttempt(
    user: User,
    key: string,
    failedAttempts: number,
  ) {
    if (failedAttempts >= FAILED_LOGIN_ATTEMPTS_TO_SEND_NOTIFICATION) {
      await this.sendFailedLoginNotifications(user);
    }
    await this.handleFailedLogin(key, failedAttempts);
  }

  private async sendFailedLoginNotifications(user: User) {
    await Promise.all([
      this.notificationProcessor.sendTemplateEmail(
        EmailTemplates.FAILED_LOGIN_ATTEMPT,
        [user.email],
        {
          userName: user.firstName,
        },
      ),
      this.notificationProcessor.sendPlatformNotification({
        messageType: ENotificationMessageType.FAILED_LOGIN_ATTEMPT,
        recipients: [{ userId: user.id }],
        subject: `Failed login attempt`,
        metadata: {
          content: {
            title: 'Failed Login Attempt',
            description: 'An unsuccessful login attempt was detected',
            body: "If this wasn't you, we recommend updating your password.",
          },
        },
      }),
    ]);
  }
}
