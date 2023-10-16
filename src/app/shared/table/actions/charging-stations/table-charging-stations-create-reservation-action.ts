import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { SpinnerService } from 'services/spinner.service';
import { ChargePointStatus, ChargingStation, Connector } from 'types/ChargingStation';
import { TableActionDef } from 'types/Table';
import { ButtonAction, ButtonActionColor, RestResponse } from 'types/GlobalType';
import {
  CreateReservationDialogData,
  Reservation,
  ReservationButtonAction,
} from 'types/Reservation';
import { DialogParamsWithAuth, ReservationsAuthorizations } from 'types/Authorization';
import { ActionResponse } from 'types/DataResult';
import { Utils } from 'utils/Utils';
import { TableAction } from '../table-action';

export interface TableChargingStationsCreateReservationActionDef extends TableActionDef {
  action: (
    chargingStationsCreateReservationDialogComponent: ComponentType<unknown>,
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

export class TableChargingStationsCreateReservationAction implements TableAction {
  private action: TableChargingStationsCreateReservationActionDef = {
    id: ReservationButtonAction.CREATE_RESERVATION,
    type: 'button',
    icon: 'book',
    color: ButtonActionColor.ACCENT,
    name: 'reservations.dialog.create.title',
    tooltip: 'reservations.dialog.create.tooltips',
    action: this.createReservation.bind(this),
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private createReservation(
    chargingStationsCreateReservationDialogComponent: ComponentType<unknown>,
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
        translateService.instant('reservations.dialog.create.title'),
        translateService.instant('reservations.dialog.create.error')
      );
      return;
    }
    if (connector.status === ChargePointStatus.UNAVAILABLE) {
      dialogService.createAndShowOkDialog(
        translateService.instant('reservations.dialog.create.title'),
        translateService.instant('reservations.dialog.create.error')
      );
      return;
    }
    // Create dialog config
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '40vw';
    dialogConfig.panelClass = '';
    // Build dialog data
    const dialogData: DialogParamsWithAuth<
    CreateReservationDialogData,
    ReservationsAuthorizations
    > = {
      dialogData: {
        id: chargingStation.id,
        chargingStation,
        connector,
      },
    };
    dialogConfig.data = dialogData;
    const dialogRef = dialog.open(chargingStationsCreateReservationDialogComponent, dialogConfig);
    dialogRef
      .afterClosed()
      .subscribe((response: [reservation: Reservation, userFullName: string]) => {
        const [reservation, userFullName] = response;
        if (reservation) {
          this.createReservationForUser(
            chargingStation,
            connector,
            userFullName,
            reservation,
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

  private createReservationForUser(
    chargingStation: ChargingStation,
    connector: Connector,
    userFullName: string,
    reservation: Reservation,
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
        translateService.instant('reservations.dialog.create.title'),
        translateService.instant('reservations.dialog.create.confirm', {
          chargingStationID: chargingStation.id,
          connectorID: Utils.getConnectorLetterFromConnectorID(connector.connectorId),
          reservationType: Utils.getReservationType(reservation.type, translateService),
        })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          if (!reservation.visualTagID) {
            messageService.showErrorMessage(
              translateService.instant('chargers.start_transaction_missing_active_tag', {
                chargeBoxID: chargingStation.id,
                userName: userFullName,
              })
            );
            return;
          }
          spinnerService.show();
          centralServerService.createReservation(reservation).subscribe({
            next: (createReservationResponse: ActionResponse) => {
              spinnerService.hide();
              if (createReservationResponse.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage(
                  translateService.instant('reservations.dialog.create.success', {
                    chargingStationID: reservation.chargingStationID,
                    connectorID: Utils.getConnectorLetterFromConnectorID(reservation.connectorID),
                  })
                );
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  messageService,
                  translateService.instant('reservations.dialog.create.error')
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
                'reservations.dialog.create.error'
              );
            },
          });
        }
      });
  }
}
