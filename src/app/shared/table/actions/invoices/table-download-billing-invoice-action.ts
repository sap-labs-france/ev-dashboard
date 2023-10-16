import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { ButtonActionColor } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { BillingButtonAction } from '../../../../types/Billing';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableDownloadBillingInvoiceDef extends TableActionDef {
  action: (
    invoiceID: string,
    filename: string,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) => void;
}

export class TableDownloadBillingInvoice implements TableAction {
  private action: TableDownloadBillingInvoiceDef = {
    id: BillingButtonAction.DOWNLOAD_INVOICE,
    type: 'button',
    icon: 'cloud_download',
    color: ButtonActionColor.PRIMARY,
    name: 'general.download',
    tooltip: 'invoices.tooltips.download',
    action: this.downloadInvoice,
  };

  // Return an action
  public getActionDef(): TableDownloadBillingInvoiceDef {
    return this.action;
  }

  // Download from UI
  private downloadInvoice(
    invoiceID: string,
    filename: string,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) {
    spinnerService.show();
    centralServerService.downloadInvoice(invoiceID).subscribe({
      next: (result) => {
        FileSaver.saveAs(result, filename);
        spinnerService.hide();
      },
      error: (error) => {
        spinnerService.hide();
        Utils.handleHttpError(
          error,
          router,
          messageService,
          centralServerService,
          translateService.instant('invoices.cannot_download_invoice')
        );
      },
    });
  }
}
