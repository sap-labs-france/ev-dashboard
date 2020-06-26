import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { TransactionButtonAction } from 'app/types/Transaction';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export class TableLinkInvoiceTransaction implements TableAction {
  private action: TableActionDef = {
    id: TransactionButtonAction.LINK_INVOICE_TRANSACTION,
    type: 'button',
    icon: 'link',
    color: ButtonColor.PRIMARY,
    name: 'transactions.dialog.link_invoice.title',
    tooltip: 'transactions.dialog.link_invoice.title',
    action: this.linkInvoice,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private linkInvoice(transactionID: number, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('transactions.dialog.link_invoice.title'),
      translateService.instant('transactions.dialog.link_invoice.confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        messageService.showInfoMessage('transactions.link_invoice_started');
        centralServerService.linkTransactionToInvoice(transactionID).subscribe((linkResponse) => {
          if (linkResponse.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('transactions.link_invoice_success');
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(linkResponse), messageService, 'transactions.link_invoice_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'transactions.link_invoice_error');
        });
      }
    });
  }
}
