import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { BillingButtonAction } from 'app/types/Billing';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import * as FileSaver from 'file-saver';

export class TableDownloadBillingInvoice implements TableAction {
  private action: TableActionDef = {
    id: BillingButtonAction.DOWNLOAD_INVOICE,
    type: 'button',
    icon: 'cloud_download',
    color: ButtonColor.PRIMARY,
    name: 'general.download',
    tooltip: 'invoices.tooltips.download',
    action: this.downloadInvoice,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private downloadInvoice(invoiceID: string, filename: string, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) {

    centralServerService.downloadInvoice({ invoiceID }).subscribe(async (result) => {
        FileSaver.saveAs(result, filename);
    }, (error) => {
      spinnerService.hide();
      Utils.handleHttpError(error, router, messageService,
        centralServerService, translateService.instant('invoices.cannot_download_invoice'));
    });
  }
}
