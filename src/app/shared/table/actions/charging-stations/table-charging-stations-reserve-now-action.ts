import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { ChargingStationsAuthorizations, DialogParamsWithAuth } from 'types/Authorization';
import {
  ChargePointStatus,
  ChargingStation,
  ChargingStationButtonAction,
  Connector,
} from 'types/ChargingStation';
import { ActionResponse } from 'types/DataResult';
import { ButtonAction, ButtonActionColor, RestResponse } from 'types/GlobalType';
import { ReserveNow, ReserveNowDialogData } from 'types/Reservation';
import { TableActionDef } from 'types/Table';
import { Utils } from 'utils/Utils';
import moment from 'moment';
import { TableAction } from '../table-action';

export interface TableChargingStationsReserveNowActionDef extends TableActionDef {
  action: (
    chargingStationReserveNowDialogComponent: ComponentType<unknown>,
    chargingStation: ChargingStation,
    connector: Connector,
    dialogService: DialogService,
    dialog: MatDialog,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableChargingStationsReserveNowAction implements TableAction {
  private action: TableChargingStationsReserveNowActionDef = {
    id: ChargingStationButtonAction.RESERVE_NOW,
    type: 'button',
    icon: 'key',
    color: ButtonActionColor.ACCENT,
    name: 'reservations.dialog.reserve_now.title',
    tooltip: 'reservations.dialog.reserve_now.tooltips',
    action: this.reserveNow.bind(this),
  };

  public getActionDef(): TableChargingStationsReserveNowActionDef {
    return this.action;
  }

  private reserveNow(
    chargingStationsReserveNowDialogComponent: ComponentType<unknown>,
    chargingStation: ChargingStation,
    connector: Connector,
    dialogService: DialogService,
    dialog: MatDialog,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    if (chargingStation.inactive) {
      dialogService.createAndShowOkDialog(
        translateService.instant('reservations.action_error.reserve_now.title'),
        translateService.instant('reservations.action_error.reserve_now.title')
      );
      return;
    }
    if (
      connector.status === ChargePointStatus.UNAVAILABLE ||
      connector.status === ChargePointStatus.RESERVED
    ) {
      dialogService.createAndShowOkDialog(
        translateService.instant('reservations.action_error.reserve_now.title'),
        translateService.instant('reservations.action_error.reserve_now.not_available')
      );
      return;
    }
    if (connector.currentTransactionID) {
      dialogService.createAndShowOkDialog(
        translateService.instant('reservations.action_error.reserve_now.title'),
        translateService.instant('chargers.action_error.transaction_in_progress')
      );
      return;
    }
    // Create dialog config
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '40vw';
    dialogConfig.panelClass = '';
    // Build dialog data
    const dialogData: DialogParamsWithAuth<ReserveNowDialogData, ChargingStationsAuthorizations> = {
      dialogData: {
        id: chargingStation.id,
        chargingStation,
        connector,
        expiryDate: moment().add(1, 'hour').toDate(), // Provide a default expiration-date within 1 hour
      },
    };
    dialogConfig.data = dialogData;
    // Show
    const dialogRef = dialog.open(chargingStationsReserveNowDialogComponent, dialogConfig);
    dialogRef
      .afterClosed()
      .subscribe((response: [reserveNowRequest: ReserveNow, userName: string, carID: string]) => {
        if (response) {
          const [reserveNowRequest, userName, carID] = response;
          this.reserveConnectorNowForUser(
            chargingStation,
            connector,
            reserveNowRequest,
            userName,
            carID,
            dialogService,
            translateService,
            messageService,
            centralServerService,
            router,
            spinnerService,
            refresh
          );
        }
      });
  }

  private reserveConnectorNowForUser(
    chargingStation: ChargingStation,
    connector: Connector,
    reserveNowRequest: ReserveNow,
    userFullName: string,
    carID: string,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService,
    refresh?: () => Observable<void>
  ): void {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('reservations.dialog.reserve_now.title'),
        translateService.instant('reservations.dialog.reserve_now.confirm', {
          chargingStationID: chargingStation.id,
          connectorID: Utils.getConnectorLetterFromConnectorID(connector.connectorId),
          userName: userFullName,
        })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          // Check badge
          if (!reserveNowRequest.visualTagID) {
            messageService.showErrorMessage(
              translateService.instant('chargers.start_transaction_missing_active_tag', {
                chargingStationID: chargingStation.id,
                userName: userFullName,
              })
            );
            return;
          }
          spinnerService.show();
          centralServerService
            .reserveNow(
              chargingStation.id,
              connector.connectorId,
              reserveNowRequest.expiryDate,
              reserveNowRequest.visualTagID,
              reserveNowRequest.reservationId ?? null,
              carID,
              reserveNowRequest?.parentIdTag
            )
            .subscribe({
              next: (reserveNowResponse: ActionResponse) => {
                spinnerService.hide();
                if (reserveNowResponse.status === RestResponse.SUCCESS) {
                  messageService.showSuccessMessage(
                    translateService.instant('reservations.dialog.reserve_now.success', {
                      chargingStationID: chargingStation.id,
                      connectorID: Utils.getConnectorLetterFromConnectorID(connector.connectorId),
                    })
                  );
                  if (refresh) {
                    refresh().subscribe();
                  }
                } else {
                  Utils.handleError(
                    JSON.stringify(response),
                    messageService,
                    translateService.instant('reservations.dialog.reserve_now.error')
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
                  'reservations.dialog.reserve_now.error'
                );
              },
            });
        }
      });
  }
}
