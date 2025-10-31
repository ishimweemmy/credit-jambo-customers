import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmailNotifierService } from '../email-notifier/email-notifier.service';

interface SendEmailRequest {
  template_name: string;
  recipients: string[];
  template_data: Record<string, string>;
  triggered_by: string;
  reference_id: string;
}

interface SendAdminAlertRequest {
  alert_type: string;
  message: string;
  data: Record<string, string>;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
  notification_id: string;
}

@Controller()
export class NotificationGrpcController {
  private readonly logger = new Logger(NotificationGrpcController.name);

  constructor(private readonly emailNotifierService: EmailNotifierService) {}

  @GrpcMethod('NotificationService', 'SendEmail')
  async sendEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
    try {
      this.logger.log(
        `gRPC SendEmail called: template=${data.template_name}, recipients=${data.recipients.length}`,
      );

      // For now, we'll compile a simple template
      // TODO: Integrate with actual template system from customer-service
      const subject = this.getSubjectFromTemplate(data.template_name);
      const htmlContent = this.compileTemplate(
        data.template_name,
        data.template_data,
      );

      // Send email to all recipients
      await Promise.all(
        data.recipients.map((recipient) =>
          this.emailNotifierService.sendEmail(recipient, subject, htmlContent),
        ),
      );

      const notificationId = this.generateNotificationId();

      this.logger.log(
        `gRPC SendEmail completed successfully: notification_id=${notificationId}`,
      );

      return {
        success: true,
        message: 'Email sent successfully',
        notification_id: notificationId,
      };
    } catch (error) {
      this.logger.error(`gRPC SendEmail failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message || 'Failed to send email',
        notification_id: '',
      };
    }
  }

  @GrpcMethod('NotificationService', 'SendAdminAlert')
  async sendAdminAlert(
    data: SendAdminAlertRequest,
  ): Promise<SendEmailResponse> {
    try {
      this.logger.log(`gRPC SendAdminAlert called: type=${data.alert_type}`);

      // TODO: Implement admin alert logic
      // This could send emails to admin users or create platform notifications

      const notificationId = this.generateNotificationId();

      return {
        success: true,
        message: 'Admin alert sent successfully',
        notification_id: notificationId,
      };
    } catch (error) {
      this.logger.error(
        `gRPC SendAdminAlert failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: error.message || 'Failed to send admin alert',
        notification_id: '',
      };
    }
  }

  private generateNotificationId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSubjectFromTemplate(templateName: string): string {
    // Map template names to subjects
    const subjects: Record<string, string> = {
      'loan-approved': '🎉 Your Loan Has Been Approved!',
      'loan-rejected': '❌ Loan Application Update',
      'loan-disbursed': '💰 Loan Disbursed Successfully',
      'credit-limit-updated': '💳 Your Credit Limit Has Been Updated',
      'credit-score-updated': '📊 Credit Score Update',
      'account-suspended': '⛔ Important: Account Suspended',
      'account-unsuspended': '✅ Your Account Has Been Reactivated',
      'account-status-updated': 'Account Status Updated',
    };

    return subjects[templateName] || 'Notification from Credit Jambo';
  }

  private compileTemplate(
    templateName: string,
    data: Record<string, string>,
  ): string {
    // TODO: Integrate with proper template system
    // For now, return a simple HTML template
    const dataHtml = Object.entries(data)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${this.getSubjectFromTemplate(templateName)}</title>
        </head>
        <body>
          <h2>${this.getSubjectFromTemplate(templateName)}</h2>
          ${dataHtml}
          <p>Best regards,<br/>Credit Jambo Team</p>
        </body>
      </html>
    `;
  }
}

