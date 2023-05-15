import { Observable } from 'rxjs';
import { Reservation, ReservationButtonAction } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { DialogService } from 'services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'services/message.service';
import { CentralServerService } from 'services/central-server.service';
import { SpinnerService } from 'services/spinner.service';
import { Router } from '@angular/router';
import { Utils } from 'utils/Utils';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteReservationActionDef extends TableActionDef {
  action: (
    reservation: Reservation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteReservationAction extends TableDeleteAction {
  public getActionDef(): TableDeleteReservationActionDef {
    return {
      ...super.getActionDef(),
      id: ReservationButtonAction.DELETE_RESERVATION,
      action: this.deleteReservation,
    };
  }

  private deleteReservation(
    reservation: Reservation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      reservation,
      'reservations.dialog.delete.title',
      translateService.instant('reservations.dialog.delete.confirm'),
      translateService.instant('reservations.dialog.delete.success', {
        chargingStationID: reservation.chargingStationID,
        connectorID: Utils.getConnectorLetterFromConnectorID(reservation.connectorID),
      }),
      'reservations.dialog.delete.error',
      centralServerService.deleteReservation.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      refresh
    );
  }
}
