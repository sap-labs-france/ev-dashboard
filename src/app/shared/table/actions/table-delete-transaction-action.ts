import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { RefundStatus } from 'app/types/Refund';
import { TableActionDef } from 'app/types/Table';
import { Transaction, TransactionButtonAction } from 'app/types/Transaction';
import { Observable } from 'rxjs';

import { TableDeleteAction } from './table-delete-action';

export class TableDeleteTransactionAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.DELETE_TRANSACTION,
      action: this.deleteTransaction,
    };
  }

  private deleteTransaction(transaction: Transaction, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    if (transaction.refundData &&
        (transaction.refundData.status === RefundStatus.SUBMITTED ||
         transaction.refundData.status === RefundStatus.APPROVED)) {
      dialogService.createAndShowOkDialog(
        translateService.instant('transactions.dialog.delete.title'),
        translateService.instant('transactions.dialog.delete.rejected_refunded_msg'));
    } else {
      super.delete(
        transaction, 'transactions.dialog.delete.title', 'transactions.dialog.delete.confirm',
        'transactions.notification.delete.success', 'transactions.notification.delete.error',
        centralServerService.deleteTransaction.bind(centralServerService),
        dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
    }
  }
}
