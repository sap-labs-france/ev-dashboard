import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParamsWithAuth, ReservationsAuthorizations } from 'types/Authorization';
import { Reservation, ReservationButtonAction } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateReservationActionDef extends TableActionDef {
  action: (
    reservationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableCreateReservationAction extends TableCreateAction {
  public getActionDef(): TableCreateReservationActionDef {
    return {
      ...super.getActionDef(),
      id: ReservationButtonAction.CREATE_RESERVATION,
      action: this.createReservation,
    };
  }

  private createReservation(
    reservationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.create(reservationDialogComponent, dialog, dialogParams, refresh);
  }
}
