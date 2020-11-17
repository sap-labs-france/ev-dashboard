import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { RestResponse } from '../../../../types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from '../../../../types/Table';
import { TransactionButtonAction } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableCreateTransactionInvoiceActionDef extends TableActionDef {
  action: (transactionID: number, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
    centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) => void;
}

export class TableCreateTransactionInvoiceAction implements TableAction {
  private action: TableCreateTransactionInvoiceActionDef = {
    id: TransactionButtonAction.CREATE_TRANSACTION_INVOICE,
    type: 'button',
    icon: 'add',
    color: ButtonColor.PRIMARY,
    name: 'transactions.dialog.create_invoice.title',
    tooltip: 'transactions.dialog.create_invoice.title',
    action: this.linkInvoice,
  };

  // Return an action
  public getActionDef(): TableCreateTransactionInvoiceActionDef {
    return this.action;
  }

  private linkInvoice(transactionID: number, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('transactions.dialog.create_invoice.title'),
      translateService.instant('transactions.dialog.create_invoice.confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.createTransactionInvoice(transactionID).subscribe((linkResponse) => {
          spinnerService.hide();
          if (linkResponse.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('transactions.create_invoice_success');
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(linkResponse), messageService, 'transactions.create_invoice_error');
          }
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'transactions.create_invoice_error');
        });
      }
    });
  }
}
