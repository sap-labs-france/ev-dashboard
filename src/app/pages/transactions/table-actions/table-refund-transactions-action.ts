import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { ActionsResponse } from 'app/types/DataResult';
import { RefundSettings } from 'app/types/Setting';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export class TableRefundTransactionsAction implements TableAction {
  private action: TableActionDef = {
    id: TransactionButtonAction.REFUND_TRANSACTIONS,
    type: 'button',
    icon: 'local_atm',
    color: ButtonColor.PRIMARY,
    name: 'general.refund',
    tooltip: 'general.tooltips.refund',
    action: this.refund,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private refund(refundSetting: RefundSettings, transactions: Transaction[], dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router,
      clearSelectedRows: () => void, refresh?: () => Observable<void>) {
    if (!refundSetting) {
      messageService.showErrorMessage(translateService.instant('transactions.notification.refund.concur_connection_invalid'));
    } else if (transactions.length === 0) {
      messageService.showErrorMessage(translateService.instant('general.select_at_least_one_record'));
    } else {
      dialogService.createAndShowYesNoDialog(
        translateService.instant('transactions.dialog.refund.title'),
        translateService.instant('transactions.dialog.refund.confirm', { quantity: transactions.length }),
      ).subscribe((response) => {
        if (response === ButtonType.YES) {
          spinnerService.show();
          centralServerService.refundTransactions(transactions.map((transaction) => transaction.id))
            .subscribe((response: ActionsResponse) => {
              if (response.inError) {
                messageService.showErrorMessage(
                  translateService.instant('transactions.notification.refund.partial',
                    {
                      inSuccess: response.inSuccess,
                      inError: response.inError,
                    },
                  ));
              } else {
                messageService.showSuccessMessage(
                  translateService.instant('transactions.notification.refund.success',
                    { inSuccess: response.inSuccess },
                  ));
              }
              spinnerService.hide();
              clearSelectedRows();
              if (refresh) {
                refresh().subscribe();
              }
          }, (error: any) => {
            spinnerService.hide();
            switch (error.status) {
              case 560: // not authorized
                Utils.handleHttpError(error, router, messageService,
                  centralServerService, 'transactions.notification.refund.not_authorized');
                break;
              case 551: // cannot refund another user transactions
                Utils.handleHttpError(error, router, messageService,
                  centralServerService, 'transactions.notification.refund.forbidden_refund_another_user');
                break;
              default:
                Utils.handleHttpError(error, router, messageService,
                  centralServerService, 'transactions.notification.refund.error');
                break;
            }
          });
        }
      });
    }
  }
}
