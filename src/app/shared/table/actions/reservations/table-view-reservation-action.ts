import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParamsWithAuth, ReservationsAuthorizations } from 'types/Authorization';
import { Reservation, ReservationButtonAction } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { TableViewAction } from '../table-view-action';

export interface TableViewReservationActionDef extends TableActionDef {
  action: (
    reservationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewReservationAction extends TableViewAction {
  public getActionDef(): TableViewReservationActionDef {
    return {
      ...super.getActionDef(),
      id: ReservationButtonAction.VIEW_RESERVATION,
      action: this.viewReservation,
    };
  }

  private viewReservation(
    reservationDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Reservation, ReservationsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.view(reservationDialogComponent, dialog, dialogParams, refresh);
  }
}
