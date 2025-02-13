import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      SendGrid.setApiKey(apiKey);
    } else {
      this.logger.warn('SendGrid API key not found. Email service will not work.');
    }
  }

  private getTemplateForEvent(eventType: string, data: any): EmailTemplate {
    switch (eventType) {
      case 'welcome':
        return {
          subject: 'Welcome to Debattle!',
          text: `Welcome to Debattle, ${data.username}! We're excited to have you join our community.`,
          html: `
            <h1>Welcome to Debattle!</h1>
            <p>Hi ${data.username},</p>
            <p>We're excited to have you join our community of critical thinkers and debaters.</p>
            <p>Get started by:</p>
            <ul>
              <li>Exploring ongoing debates</li>
              <li>Creating your first debate</li>
              <li>Setting up your profile</li>
            </ul>
            <p>Happy debating!</p>
          `,
        };
      case 'debate_reply':
        return {
          subject: 'New Reply to Your Debate',
          text: `${data.commenterName} has replied to your debate "${data.debateTitle}"`,
          html: `
            <h2>New Reply to Your Debate</h2>
            <p>${data.commenterName} has replied to your debate "${data.debateTitle}"</p>
            <p>Click <a href="${data.debateUrl}">here</a> to view the reply.</p>
          `,
        };
      case 'badge_earned':
        return {
          subject: "Congratulations! You've Earned a New Badge",
          text: `You've earned the ${data.badgeName} badge! ${data.badgeDescription}`,
          html: `
            <h2>🏆 New Badge Earned!</h2>
            <p>Congratulations! You've earned the <strong>${data.badgeName}</strong> badge.</p>
            <p>${data.badgeDescription}</p>
            <img src="${data.badgeIcon}" alt="${data.badgeName}" style="width: 100px; height: 100px;"/>
            <p>Keep up the great work!</p>
          `,
        };
      case 'debate_featured':
        return {
          subject: 'Your Debate Has Been Featured!',
          text: `Congratulations! Your debate "${data.debateTitle}" has been featured on Debattle.`,
          html: `
            <h2>🌟 Your Debate is Featured!</h2>
            <p>Congratulations! Your debate "${data.debateTitle}" has been featured on Debattle.</p>
            <p>This means your debate will receive more visibility and engagement from our community.</p>
            <p>View your featured debate <a href="${data.debateUrl}">here</a>.</p>
          `,
        };
      default:
        throw new Error(`Unknown email template type: ${eventType}`);
    }
  }

  async sendEmail(
    to: string,
    eventType: string,
    data: any,
    options: { attachments?: any[] } = {},
  ): Promise<boolean> {
    try {
      const template = this.getTemplateForEvent(eventType, data);
      const msg = {
        to,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL', 'notifications@debattle.com'),
        subject: template.subject,
        text: template.text,
        html: template.html,
        attachments: options.attachments,
      };

      await SendGrid.send(msg);
      this.logger.log(`Email sent successfully to ${to} for event ${eventType}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to} for event ${eventType}:`, error);
      return false;
    }
  }

  async sendBulkEmails(
    recipients: string[],
    eventType: string,
    data: any,
    options: { attachments?: any[] } = {},
  ): Promise<boolean> {
    try {
      const template = this.getTemplateForEvent(eventType, data);
      const messages = recipients.map(to => ({
        to,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL', 'notifications@debattle.com'),
        subject: template.subject,
        text: template.text,
        html: template.html,
        attachments: options.attachments,
      }));

      await SendGrid.send(messages);
      this.logger.log(`Bulk email sent successfully to ${recipients.length} recipients for event ${eventType}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send bulk email for event ${eventType}:`, error);
      return false;
    }
  }
} 