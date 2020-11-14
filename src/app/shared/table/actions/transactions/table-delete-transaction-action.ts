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
import { Utils } from '../../../../utils/Utils';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteTransactionActionDef extends TableActionDef {
  action: (transaction: Transaction, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableDeleteTransactionAction extends TableDeleteAction {
  public getActionDef(): TableDeleteTransactionActionDef {
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
    } else if (transaction.billingData && transaction.billingData.invoiceID) {
      dialogService.createAndShowOkDialog(
        translateService.instant('transactions.dialog.delete.title'),
        translateService.instant('transactions.dialog.delete.rejected_billed_msg'));
    } else {
      super.delete(
        transaction, 'transactions.dialog.delete.title',
        translateService.instant('transactions.dialog.delete.confirm', { user: Utils.buildUserFullName(transaction.user) }),
        translateService.instant('transactions.notification.delete.success', { user: Utils.buildUserFullName(transaction.user) }),
        'transactions.notification.delete.error',
        centralServerService.deleteTransaction.bind(centralServerService),
        dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
    }
  }
}
