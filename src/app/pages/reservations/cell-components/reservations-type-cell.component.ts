import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import { ChipType } from 'types/GlobalType';
import { Reservation, ReservationType } from 'types/Reservation';
import { Utils } from 'utils/Utils';

@Component({
  template: `
    <mat-chip-list [selectable]="false">
      <mat-chip [ngClass]="row.type | appReservationsFormatType : 'class'" [disabled]="true">
        {{ row.type | appReservationsFormatType : 'text' | translate }}
      </mat-chip>
    </mat-chip-list>
  `,
})
export class ReservationsTypeFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Reservation;
}

@Pipe({ name: 'appReservationsFormatType' })
export class AppReservationsFormatTypePipe implements PipeTransform {
  public transform(reservationType: string, type: string): string {
    if (type === 'class') {
      return this.buildReservationTypeClasses(reservationType);
    }
    if (type === 'text') {
      return this.buildReservationTypeText(reservationType);
    }
    return '';
  }

  public buildReservationTypeClasses(reservationType: string): string {
    let classNames = 'chip-width-10em ';
    switch (reservationType) {
      case ReservationType.RESERVE_NOW:
        classNames += Utils.replaceAll(ReservationType.RESERVE_NOW, '_', '-');
        break;
      case ReservationType.PLANNED_RESERVATION:
        classNames += Utils.replaceAll(ReservationType.PLANNED_RESERVATION, '_', '-');
        break;
      default:
        classNames += ChipType.DEFAULT;
    }
    return classNames;
  }

  public buildReservationTypeText(reservationType: string): string {
    return `reservations.types.${reservationType ? reservationType.toLowerCase() : 'unknown'}`;
  }
}
