import { BUTTON_FOR_MYSELF, BUTTON_SELECT_USER, ChargingStationsStartTransactionDialogComponent } from 'app/pages/charging-stations/details-component/charging-stations-start-transaction-dialog-component';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { ChargingStation, ChargingStationButtonAction, ConnStatus, Connector, OCPPGeneralResponse } from 'app/types/ChargingStation';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User, UserToken } from 'app/types/User';

import { ActionResponse } from 'app/types/DataResult';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { TranslateService } from '@ngx-translate/core';
import { Users } from 'app/utils/Users';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { Utils } from 'app/utils/Utils';

export class TableChargingStationsStartTransactionAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.START_TRANSACTION,
    type: 'button',
    icon: 'play_arrow',
    color: ButtonColor.ACCENT,
    name: 'general.start',
    tooltip: 'general.tooltips.start',
    action: this.startTransaction.bind(this),
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private startTransaction(chargingStation: ChargingStation, connector: Connector, authorizationService: AuthorizationService,
      dialogService: DialogService, dialog: MatDialog, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
      refresh?: () => Observable<void>) {
    if (chargingStation.inactive) {
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.transaction_start_title'),
        translateService.instant('chargers.action_error.transaction_start_chargingStation_inactive'));
      return;
    }
    if (connector.status === ConnStatus.UNAVAILABLE) {
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.transaction_start_title'),
        translateService.instant('chargers.action_error.transaction_start_not_available'));
      return;
    }
    if (connector.activeTransactionID) {
      dialogService.createAndShowOkDialog(
        translateService.instant('chargers.action_error.transaction_start_title'),
        translateService.instant('chargers.action_error.transaction_in_progress'));
      return;
    }
    // Check
    if (authorizationService.isAdmin()) {
      // Create dialog data
      const dialogConfig = new MatDialogConfig();
      dialogConfig.panelClass = '';
      // Set data
      dialogConfig.data = {
        title: 'chargers.start_transaction_admin_title',
        message: 'chargers.start_transaction_admin_message',
      };
      // Show
      const dialogRef = dialog.open(ChargingStationsStartTransactionDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe((buttonId) => {
        switch (buttonId) {
          case BUTTON_FOR_MYSELF:
            return this.startTransactionForUser(chargingStation, connector, null, centralServerService.getLoggedUser(),
              dialogService, translateService, messageService, centralServerService, router, spinnerService, refresh);
          case BUTTON_SELECT_USER:
            // Show select user dialog
            dialogConfig.data = {
              title: 'chargers.start_transaction_user_select_title',
              validateButtonTitle: 'chargers.start_transaction_user_select_button',
              rowMultipleSelection: false,
            };
            dialogConfig.panelClass = 'transparent-dialog-container';
            const dialogRef2 = dialog.open(UsersDialogComponent, dialogConfig);
            // Add sites
            dialogRef2.afterClosed().subscribe((data) => {
              if (data && data.length > 0) {
                return this.startTransactionForUser(chargingStation, connector, data[0].objectRef, centralServerService.getLoggedUser(),
                  dialogService, translateService, messageService, centralServerService, router, spinnerService, refresh);
              }
            });
            break;
        }
      });
    } else {
      this.startTransactionForUser(chargingStation, connector, null, centralServerService.getLoggedUser(),
        dialogService, translateService, messageService, centralServerService, router, spinnerService, refresh);
    }
  }

  private startTransactionForUser(chargingStation: ChargingStation, connector: Connector, user: User | null,
      loggedUser: UserToken, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, router: Router, spinnerService: SpinnerService, refresh?: () => Observable<void>): void {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('chargers.start_transaction_title'),
      translateService.instant('chargers.start_transaction_confirm', {
        chargeBoxID: chargingStation.id,
        userName: Users.buildUserFullName(user ? user : loggedUser),
      }),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        // Check badge
        let tagId;
        if (user) {
          if (user.tags.find((value) => value.active === true)) {
            tagId = user.tags.find((value) => value.active === true).id;
          }
        } else if (loggedUser.tagIDs && loggedUser.tagIDs.length > 0) {
          tagId = loggedUser.tagIDs[0];
        }
        if (!tagId) {
          messageService.showErrorMessage(
            translateService.instant('chargers.start_transaction_missing_active_tag', {
              chargeBoxID: chargingStation.id,
              userName: Users.buildUserFullName(user ? user : loggedUser),
            }));
          return;
        }
        spinnerService.show();
        centralServerService.chargingStationStartTransaction(
          chargingStation.id, connector.connectorId, tagId).subscribe((startTransactionResponse: ActionResponse) => {
          spinnerService.hide();
          if (startTransactionResponse.status === OCPPGeneralResponse.ACCEPTED) {
            messageService.showSuccessMessage(
              translateService.instant('chargers.start_transaction_success', { chargeBoxID: chargingStation.id }));
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(response),
              messageService, translateService.instant('chargers.start_transaction_error'));
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService, 'chargers.start_transaction_error');
        });
      }
    });
  }
}
