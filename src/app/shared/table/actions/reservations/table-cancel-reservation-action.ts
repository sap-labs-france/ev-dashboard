import { Observable } from 'rxjs';
import { Reservation, ReservationButtonAction } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { DialogService } from 'services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'services/message.service';
import { CentralServerService } from 'services/central-server.service';
import { SpinnerService } from 'services/spinner.service';
import { Router } from '@angular/router';
import { ButtonAction, ButtonActionColor, RestResponse } from 'types/GlobalType';
import { Utils } from 'utils/Utils';
import { TableAction } from '../table-action';

export interface TableCancelReservationActionDef extends TableActionDef {
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

export class TableCancelReservationAction implements TableAction {
  public getActionDef(): TableCancelReservationActionDef {
    return {
      ...{
        id: ButtonAction.CANCEL,
        type: 'button',
        icon: 'cancel',
        color: ButtonActionColor.WARN,
        name: 'reservations.dialog.cancel_reservation.title',
        tooltip: 'reservations.dialog.cancel_reservation.tooltips',
      },
      id: ReservationButtonAction.CANCEL_RESERVATION,
      action: this.cancelReservation,
    };
  }

  private cancelReservation(
    reservation: Reservation,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        'reservations.dialog.cancel_reservation.title',
        translateService.instant('reservations.dialog.cancel_reservation.confirm', {
          reservationID: reservation.id,
          chargingStationID: reservation.chargingStationID,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.cancelReservation(reservation).subscribe({
            next: (response) => {
              spinnerService.hide();
              if (response.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage(
                  translateService.instant('reservations.dialog.cancel_reservation.success', {
                    chargingStationID: reservation.chargingStationID,
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
                    chargingStationID: reservation.chargingStationID,
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
                  chargingStationID: reservation.chargingStationID,
                })
              );
            },
          });
        }
      });
  }
}
