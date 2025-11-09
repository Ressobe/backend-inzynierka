import { Injectable } from '@nestjs/common';
import { MailerService } from '../infrastructure/mailer.service';
import { ReservationStatus } from 'src/reservations/domain/reservation.entity';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailer: MailerService) {}

  async sendReservationCreated(to: string, name: string, cancelUrl: string) {
    await this.mailer.sendMail(
      to,
      'Twoja rezerwacja została złożona',
      'reservation-created',
      {
        name,
        cancelUrl,
      },
    );
  }

  async sendReservationStatusUpdated(
    toEmail: string,
    toName: string,
    status: ReservationStatus,
  ) {
    let subject: string;
    let template: string;
    let context: any;

    switch (status) {
      case ReservationStatus.ACCEPTED:
        subject = 'Rezerwacja została potwierdzona';
        template = 'reservation-confirmed';
        context = { name: toName };
        break;
      case ReservationStatus.REJECTED || ReservationStatus.CANCELLED:
        subject = 'Rezerwacja została odrzucona';
        template = 'reservation-rejected';
        context = { name: toName };
        break;
      default:
        subject = `Status rezerwacji zmieniony na: ${status}`;
        template = 'reservation-status-updated';
        context = { name: toName, status: status };
        break;
    }

    await this.mailer.sendMail(toEmail, subject, template, context);
  }

  async sendReservationCancelled(to: string, name: string) {
    await this.mailer.sendMail(
      to,
      'Rezerwacja została anulowana',
      'reservation-cancelled',
      {
        name,
      },
    );
  }
}
