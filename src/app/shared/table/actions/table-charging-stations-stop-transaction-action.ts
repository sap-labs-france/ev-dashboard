import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { ChargingStationButtonAction, ConnStatus, OCPPGeneralResponse } from 'app/types/ChargingStation';

import { ActionResponse } from 'app/types/DataResult';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { Transaction } from 'app/types/Transaction';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

export class TableChargingStationsStopTransactionAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.STOP_TRANSACTION,
    type: 'button',
    icon: 'stop',
    color: ButtonColor.WARN,
    name: 'general.stop',
    tooltip: 'general.tooltips.stop',
    action: this.stopTransaction.bind(this),
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private stopTransaction(transaction: Transaction, authorizationService: AuthorizationService,
      dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
      refresh?: () => Observable<void>) {
    // Get the charging station
    centralServerService.getChargingStation(transaction.chargeBoxID).subscribe((chargingStation) => {
      const connector = chargingStation.connectors[transaction.connectorId-1];
      const isStopAuthorized = !!connector.activeTransactionID && authorizationService.canStopTransaction(chargingStation.siteArea, connector.activeTagID);
      if (!isStopAuthorized) {
        dialogService.createAndShowOkDialog(
          translateService.instant('chargers.action_error.transaction_stop_title'),
          translateService.instant('chargers.action_error.transaction_stop_not_authorized'));
      }
      if (chargingStation.inactive) {
        dialogService.createAndShowOkDialog(
          translateService.instant('chargers.action_error.transaction_stop_title'),
          translateService.instant('chargers.action_error.transaction_stop_charger_inactive'));
        return;
      }
      if (connector.status === ConnStatus.UNAVAILABLE) {
        dialogService.createAndShowOkDialog(
          translateService.instant('chargers.action_error.transaction_stop_title'),
          translateService.instant('chargers.action_error.transaction_stop_not_available'));
        return;
      }
      if (!connector.activeTransactionID) {
        dialogService.createAndShowOkDialog(
          translateService.instant('chargers.action_error.transaction_stop_title'),
          translateService.instant('chargers.action_error.no_active_transaction'));
      }
      // Check authorization
      dialogService.createAndShowYesNoDialog(
        translateService.instant('chargers.stop_transaction_title'),
        translateService.instant('chargers.stop_transaction_confirm', { chargeBoxID: chargingStation.id }),
      ).subscribe((response) => {
        if (response === ButtonType.YES) {
          if (connector.status !== ConnStatus.AVAILABLE) {
            // Remote Stop
            spinnerService.show();
            centralServerService.chargingStationStopTransaction(chargingStation.id, connector.activeTransactionID)
                .subscribe((response2: ActionResponse) => {
              spinnerService.hide();
              if (response2.status === OCPPGeneralResponse.ACCEPTED) {
                messageService.showSuccessMessage(
                  translateService.instant('chargers.stop_transaction_success', { chargeBoxID: chargingStation.id }));
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(JSON.stringify(response),
                  messageService, translateService.instant('chargers.stop_transaction_error'));
              }
            }, (error) => {
              spinnerService.hide();
              Utils.handleHttpError(error, router, messageService,
                centralServerService, 'chargers.stop_transaction_error');
            });
          } else {
            // Soft Stop
            centralServerService.softStopTransaction(transaction.id).subscribe((response: ActionResponse) => {
              if (response.status === 'Invalid') {
                messageService.showErrorMessage(
                  translateService.instant('transactions.notification.soft_stop.error'));
              } else {
                messageService.showSuccessMessage(
                  translateService.instant('transactions.notification.soft_stop.success',
                    { user: Utils.buildUserFullName(transaction.user) }));
                if (refresh) {
                  refresh().subscribe();
                }
              }
            }, (error) => {
              // tslint:disable-next-line:max-line-length
              Utils.handleHttpError(error, router, messageService,
                centralServerService, 'transactions.notification.soft_stop.error');
            });
          }
        }
      });
    }, (error) => {
      Utils.handleHttpError(error, router, messageService,
        centralServerService, 'chargers.charger_not_found');
    });
  }
}
