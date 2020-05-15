import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableDeleteManyAction } from 'app/shared/table/actions/table-delete-many-action';
import { RefundStatus } from 'app/types/Refund';
import { TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Observable } from 'rxjs';

export class TableDeleteTransactionsAction extends TableDeleteManyAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.DELETE_TRANSACTIONS,
      action: this.deleteTransactions,
    };
  }

  private deleteTransactions(transactions: Transaction[], dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, spinnerService: SpinnerService,
      router: Router, clearSelectedRows: () => void, refresh?: () => Observable<void>) {
    // Empty?
    if (transactions.length === 0) {
      messageService.showErrorMessage(translateService.instant('general.select_at_least_one_record'));
      return;
    }
    // Check
    for (const transaction of transactions) {
      if (transaction.refundData &&
         (transaction.refundData.status === RefundStatus.SUBMITTED ||
          transaction.refundData.status === RefundStatus.APPROVED)) {
        dialogService.createAndShowOkDialog(
          translateService.instant('transactions.dialog.delete.title'),
          translateService.instant('transactions.dialog.delete.rejected_refunded_msg'));
        return;
      }
    }
    // Delete them
    super.deleteMany(transactions, 'transactions.delete_transactions_title',
      'transactions.delete_transactions_confirm', 'transactions.delete_transactions_success', 'transactions.delete_transactions_partial',
      'transactions.delete_transactions_error', centralServerService.deleteTransactions.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router,
      clearSelectedRows, refresh);
  }
}
