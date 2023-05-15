import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ButtonAction, ButtonActionColor, RestResponse } from 'types/GlobalType';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import {
  ChargePointStatus,
  ChargingStation,
  ChargingStationButtonAction,
  Connector,
} from 'types/ChargingStation';
import { TableActionDef } from 'types/Table';
import { ActionResponse } from 'types/DataResult';
import { Utils } from 'utils/Utils';
import { Reservation } from 'types/Reservation';
import { TableAction } from '../table-action';

export interface TableChargingStationsCancelReservationActionDef extends TableActionDef {
  action: (
    chargingStation: ChargingStation,
    connector: Connector,
    reservation: Partial<Reservation>,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableChargingStationsCancelReservationAction implements TableAction {
  private action: TableChargingStationsCancelReservationActionDef = {
    id: ChargingStationButtonAction.CANCEL_RESERVATION,
    type: 'button',
    icon: 'key_off',
    color: ButtonActionColor.WARN,
    name: 'reservations.dialog.cancel_reservation.title',
    tooltip: 'reservations.dialog.cancel_reservation.tooltips',
    action: this.cancelReservation.bind(this),
  };

  public getActionDef(): TableChargingStationsCancelReservationActionDef {
    return this.action;
  }

  private cancelReservation(
    chargingStation: ChargingStation,
    connector: Connector,
    reservation: Partial<Reservation>,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    if (chargingStation.inactive) {
      dialogService.createAndShowOkDialog(
        translateService.instant('reservations.action_error.cancel_reservation.title'),
        translateService.instant('reservations.action_error.cancel_reservation.title')
      );
      return;
    }
    if (connector.status === ChargePointStatus.UNAVAILABLE) {
      dialogService.createAndShowOkDialog(
        translateService.instant('reservations.action_error.cancel_reservation.title'),
        translateService.instant('reservations.action_error.cancel_reservation.not_available')
      );
      return;
    }

    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('reservations.dialog.cancel_reservation.title'),
        translateService.instant('reservations.dialog.cancel_reservation.confirm', {
          chargingStationID: chargingStation.id,
        })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          centralServerService
            .cancelReserveNowReservation(chargingStation.id, reservation.id)
            .subscribe({
              next: (cancelReservationResponse: ActionResponse) => {
                spinnerService.hide();
                if (cancelReservationResponse.status === RestResponse.SUCCESS) {
                  messageService.showSuccessMessage(
                    translateService.instant('reservations.dialog.cancel_reservation.success', {
                      chargingStationID: chargingStation.id,
                    })
                  );
                  if (refresh) {
                    refresh().subscribe();
                  }
                } else {
                  Utils.handleError(
                    JSON.stringify(response),
                    messageService,
                    translateService.instant('reservations.dialog.cancel_reservation.error', {
                      chargingStationID: chargingStation.id,
                    })
                  );
                }
              },
              error: (error) => {
                spinnerService.hide();
                Utils.handleHttpError(
                  error,
                  router,
                  messageService,
                  centralServerService,
                  translateService.instant('reservations.dialog.cancel_reservation.error', {
                    chargingStationID: chargingStation.id,
                  })
                );
              },
            });
        }
      });
  }
}
