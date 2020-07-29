import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';

export class TableRebuildTransactionConsumptionsAction implements TableAction {
  private action: TableActionDef = {
    id: TransactionButtonAction.REBUILD_TRANSACTION_CONSUMPTIONS,
    type: 'button',
    icon: 'build',
    color: ButtonColor.PRIMARY,
    name: 'transactions.rebuild_transaction_consumptions_title',
    tooltip: 'transactions.rebuild_transaction_consumptions_title',
    action: this.rebuildTransactionConsumptions,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private rebuildTransactionConsumptions(transaction: Transaction, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router, spinnerService: SpinnerService) {
    // Confirm
    dialogService.createAndShowYesNoDialog(
      translateService.instant('transactions.rebuild_transaction_consumptions_title'),
      translateService.instant('transactions.rebuild_transaction_consumptions_confirm'),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        spinnerService.show();
        centralServerService.rebuildTransactionConsumption(transaction.id).subscribe((response) => {
          spinnerService.hide();
          if (response.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('transactions.rebuild_transaction_consumptions_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              messageService, 'transactions.rebuild_transaction_consumptions_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService, 'transactions.rebuild_transaction_consumptions_error');
        });
      }
    });
    }
}
