import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { RefundStatus } from '../../../../types/Refund';
import { TableActionDef } from '../../../../types/Table';
import { Transaction, TransactionButtonAction } from '../../../../types/Transaction';
import { TableDeleteManyAction } from '../table-delete-many-action';

export interface TableDeleteTransactionsActionDef extends TableActionDef {
  action: (
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

export class TableDeleteTransactionsAction extends TableDeleteManyAction {
  public getActionDef(): TableDeleteTransactionsActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.DELETE_TRANSACTIONS,
      action: this.deleteTransactions,
    };
  }

  private deleteTransactions(
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
    // Empty?
    if (transactions.length === 0) {
      messageService.showErrorMessage(
        translateService.instant('general.select_at_least_one_record')
      );
      return;
    }
    for (const transaction of transactions) {
      if (
        transaction.refundData &&
        (transaction.refundData.status === RefundStatus.SUBMITTED ||
          transaction.refundData.status === RefundStatus.APPROVED)
      ) {
        dialogService.createAndShowOkDialog(
          translateService.instant('transactions.dialog.delete.title'),
          translateService.instant('transactions.dialog.delete.rejected_refunded_msg')
        );
        return;
      }
    }
    // Delete them
    super.deleteMany(
      transactions,
      'transactions.delete_transactions_title',
      'transactions.delete_transactions_confirm',
      'transactions.delete_transactions_success',
      'transactions.delete_transactions_partial',
      'transactions.delete_transactions_error',
      'transactions.delete_no_transaction',
      'transactions.delete_transactions_unexpected_error',
      centralServerService.deleteTransactions.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      clearSelectedRows,
      refresh
    );
  }
}
