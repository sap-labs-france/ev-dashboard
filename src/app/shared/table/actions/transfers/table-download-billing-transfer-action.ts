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

export interface TableDownloadBillingTransferDef extends TableActionDef {
  action: (transferID: string, filename: string, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) => void;
}

export class TableDownloadBillingTransfer implements TableAction {
  private action: TableDownloadBillingTransferDef = {
    id: TransferButtonAction.DOWNLOAD_TRANSFER,
    type: 'button',
    icon: 'cloud_download',
    color: ButtonActionColor.PRIMARY,
    name: 'general.download',
    tooltip: 'transfers.tooltips.download',
    action: this.downloadtransfer,
  };

  // Return an action
  public getActionDef(): TableDownloadBillingTransferDef {
    return this.action;
  }

  // Download from UI
  private downloadtransfer(transferID: string, filename: string, translateService: TranslateService, spinnerService: SpinnerService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router) {
    spinnerService.show();
    centralServerService.downloadTransfer(transferID).subscribe((result) => {
      FileSaver.saveAs(result, filename);
      spinnerService.hide();
    }, (error) => {
      spinnerService.hide();
      Utils.handleHttpError(error, router, messageService,
        centralServerService, translateService.instant('transfers.cannot_download_transfer'));
    });
  }
}
