import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParamsWithAuth, ReservationsAuthorizations } from 'types/Authorization';
import { Reservation, ReservationButtonAction } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditReservationActionDef extends TableActionDef {
  action: (
    reservationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditReservationAction extends TableEditAction {
  public getActionDef(): TableEditReservationActionDef {
    return {
      ...super.getActionDef(),
      id: ReservationButtonAction.EDIT_RESERVATION,
      action: this.editReservation,
    };
  }

  private editReservation(
    reservationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(reservationDialogComponent, dialog, dialogParams, refresh);
  }
}
