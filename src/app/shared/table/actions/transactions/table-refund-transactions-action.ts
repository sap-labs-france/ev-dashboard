import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonAction, ButtonActionColor } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ActionsResponse } from '../../../../types/DataResult';
import { HTTPError } from '../../../../types/HTTPError';
import { RefundSettings } from '../../../../types/Setting';
import { TableActionDef } from '../../../../types/Table';
import { Transaction, TransactionButtonAction } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableRefundTransactionsActionDef extends TableActionDef {
  action: (
    refundSetting: RefundSettings,
    transactions: Transaction[],
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableRefundTransactionsAction implements TableAction {
  private action: TableRefundTransactionsActionDef = {
    id: TransactionButtonAction.REFUND_TRANSACTIONS,
    type: 'button',
    icon: 'local_atm',
    color: ButtonActionColor.PRIMARY,
    name: 'general.refund',
    tooltip: 'general.tooltips.refund',
    action: this.refund,
    linkedToListSelection: true,
  };

  // Return an action
  public getActionDef(): TableRefundTransactionsActionDef {
    return this.action;
  }

  private refund(
    refundSetting: RefundSettings,
    transactions: Transaction[],
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) {
    if (!refundSetting) {
      messageService.showErrorMessage(
        translateService.instant('transactions.notification.refund.concur_connection_invalid')
      );
    } else if (transactions.length === 0) {
      messageService.showErrorMessage(
        translateService.instant('general.select_at_least_one_record')
      );
    } else {
      dialogService
        .createAndShowYesNoDialog(
          translateService.instant('transactions.dialog.refund.title'),
          translateService.instant('transactions.dialog.refund.confirm', {
            quantity: transactions.length,
          })
        )
        .subscribe((response) => {
          if (response === ButtonAction.YES) {
            spinnerService.show();
            centralServerService
              .refundTransactions(transactions.map((transaction) => transaction.id))
              .subscribe({
                next: (res: ActionsResponse) => {
                  // TODO: use messageService.showActionsMessage(...) method and remove the if statements
                  if (res.inError) {
                    messageService.showErrorMessage(
                      translateService.instant('transactions.notification.refund.partial', {
                        inSuccess: res.inSuccess,
                        inError: res.inError,
                      })
                    );
                  } else {
                    messageService.showSuccessMessage(
                      translateService.instant('transactions.notification.refund.success', {
                        inSuccess: res.inSuccess,
                      })
                    );
                  }
                  spinnerService.hide();
                  clearSelectedRows();
                  if (refresh) {
                    refresh().subscribe();
                  }
                },
                error: (error: any) => {
                  spinnerService.hide();
                  switch (error.status) {
                    case HTTPError.REFUND_SESSION_OTHER_USER_ERROR:
                      Utils.handleHttpError(
                        error,
                        router,
                        messageService,
                        centralServerService,
                        'transactions.notification.refund.forbidden_refund_another_user'
                      );
                      break;
                    case HTTPError.REFUND_CONNECTION_ERROR:
                      Utils.handleHttpError(
                        error,
                        router,
                        messageService,
                        centralServerService,
                        'settings.refund.connection_error'
                      );
                      break;
                    default:
                      Utils.handleHttpError(
                        error,
                        router,
                        messageService,
                        centralServerService,
                        'transactions.notification.refund.error'
                      );
                      break;
                  }
                },
              });
          }
        });
    }
  }
}
