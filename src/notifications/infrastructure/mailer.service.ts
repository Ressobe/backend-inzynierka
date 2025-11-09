import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private readonly templatesDir: string;
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment =
      this.configService.get<string>('NODE_ENV') === 'development';

    if (this.isDevelopment) {
      this.transporter = nodemailer.createTransport({
        host:
          this.configService.get<string>('SMTP_HOST_DEV') ||
          'smtp.ethereal.email',
        port: this.configService.get<number>('SMTP_PORT_DEV') || 587,
        secure: this.configService.get<string>('SMTP_SECURE_DEV') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER_DEV'),
          pass: this.configService.get<string>('SMTP_PASS_DEV'),
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: this.configService.get<number>('SMTP_PORT'),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }

    this.templatesDir = path.join(__dirname, 'templates');
  }

  async sendMail(
    to: string,
    subject: string,
    templateName: string,
    context: any,
  ) {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      this.logger.error(`Template not found: ${templatePath}`);
      throw new Error('Email template not found');
    }

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const compileTemplate = handlebars.compile(templateSource);
    const html = compileTemplate(context);

    const mailOptions = {
      from:
        this.configService.get<string>('SMTP_FROM') ||
        'no-reply@restaurant-booking.pl',
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      if (this.isDevelopment && info.envelope && info.messageId) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Email preview available at: ${previewUrl}`);
        }
      } else {
        this.logger.log(`Email sent to ${to}: ${subject}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      throw error;
    }
  }
}
