import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as FileSaver from 'file-saver';
import { ButtonActionColor } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TransferButtonAction } from '../../../../types/Billing';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableDownloadCommissionInvoiceDef extends TableActionDef {
  action: (
    transferID: string,
    filename: string,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) => void;
}

export class TableDownloadCommissionInvoice implements TableAction {
  private action: TableDownloadCommissionInvoiceDef = {
    id: TransferButtonAction.DOWNLOAD_COMMISSION_INCOICE,
    type: 'button',
    icon: 'cloud_download',
    color: ButtonActionColor.PRIMARY,
    name: 'general.download',
    tooltip: 'transfers.tooltips.download',
    action: this.downloadCommissionInvoice,
  };

  // Return an action
  public getActionDef(): TableDownloadCommissionInvoiceDef {
    return this.action;
  }

  // Download from UI
  private downloadCommissionInvoice(
    transferID: string,
    filename: string,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router
  ) {
    spinnerService.show();
    centralServerService.downloadCommissionInvoice(transferID).subscribe({
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
          translateService.instant('transfers.cannot_download_commission_incoice')
        );
      },
    });
  }
}
