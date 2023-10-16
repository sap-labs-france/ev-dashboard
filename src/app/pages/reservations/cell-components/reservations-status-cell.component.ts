import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { RESERVATION_STATUSES } from 'shared/model/reservations.model';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from 'types/GlobalType';
import { Reservation, ReservationStatus } from 'types/Reservation';
import { Utils } from 'utils/Utils';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.status | appReservationsFormatStatus : 'class'" [disabled]="true">
        {{ row.status | appReservationsFormatStatus : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class ReservationStatusFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Reservation;
}

@Pipe({ name: 'appReservationsFormatStatus' })
export class AppReservationsFormatStatusPipe implements PipeTransform {
  public transform(reservationStatus: string, type: string) {
    if (type === 'class') {
      return this.buildReservationStatusClasses(reservationStatus);
    }
    if (type === 'text') {
      return this.buildReservationStatusText(reservationStatus);
    }
    return '';
  }

  public buildReservationStatusClasses(status: string): string {
    let classNames = 'chip-width-8em ';
    switch (status) {
      case ReservationStatus.DONE:
        classNames += Utils.replaceAll(ReservationStatus.DONE, '_', '-');
        break;
      case ReservationStatus.SCHEDULED:
        classNames += Utils.replaceAll(ReservationStatus.SCHEDULED, '_', '-');
        break;
      case ReservationStatus.CANCELLED:
        classNames += Utils.replaceAll(ReservationStatus.CANCELLED, '_', '-');
        break;
      case ReservationStatus.INACTIVE:
        classNames += Utils.replaceAll(ReservationStatus.INACTIVE, '_', '-');
        break;
      case ReservationStatus.EXPIRED:
        classNames += Utils.replaceAll(ReservationStatus.EXPIRED, '_', '-');
        break;
      case ReservationStatus.IN_PROGRESS:
        classNames += Utils.replaceAll(ReservationStatus.IN_PROGRESS, '_', '-');
        break;
      case ReservationStatus.UNMET:
        classNames += Utils.replaceAll(ReservationStatus.UNMET, '_', '-');
        break;
      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildReservationStatusText(status: string): string {
    for (const reservationStatus of RESERVATION_STATUSES) {
      if (reservationStatus.key === status) {
        return reservationStatus.value;
      }
    }
    return '';
  }
}
