import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonActionColor, RestResponse } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TransferButtonAction } from '../../../../types/Billing';
import { TableActionDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TableSendBillingTransferDef extends TableActionDef {
  action: (
    ID: string,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableSendBillingTransferAction implements TableAction {
  private action: TableSendBillingTransferDef = {
    id: TransferButtonAction.SEND_TRANSFER,
    type: 'button',
    icon: 'cloud_upload',
    color: ButtonActionColor.PRIMARY,
    name: 'transfers.tooltips.send',
    tooltip: 'transfers.tooltips.send',
    action: this.sendTransfer,
  };

  public getActionDef(): TableSendBillingTransferDef {
    return this.action;
  }

  private sendTransfer(
    ID: string,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    spinnerService.show();
    centralServerService.sendTransfer(ID).subscribe({
      next: (response) => {
        spinnerService.hide();
        if (response.status === RestResponse.SUCCESS) {
          if (refresh) {
            refresh().subscribe();
          }
          // TODO - messageService.showSuccessMessage(translateService.instant('transfers.transfer_finalize_success'));
        } else {
          // TODO - Utils.handleError(JSON.stringify(response), messageService, 'transfers.transfer_finalize_failure');
        }
      },
      error: (error) => {
        spinnerService.hide();
        Utils.handleHttpError(
          error,
          router,
          messageService,
          centralServerService,
          translateService.instant('transfers.cannot_send_transfer')
        );
      },
    });
  }
}
