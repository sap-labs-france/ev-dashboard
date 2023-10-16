import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TransactionButtonAction } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';
import { TableSynchronizeAction } from '../table-synchronize-action';

export interface TableSyncRefundTransactionsActionDef extends TableActionDef {
  action: (
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableSyncRefundTransactionsAction extends TableSynchronizeAction {
  public getActionDef(): TableSyncRefundTransactionsActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.REFUND_SYNCHRONIZE,
      name: 'general.synchronize',
      action: this.synchronizeRefund,
    };
  }

  private synchronizeRefund(
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('settings.refund.synchronize_dialog_refund_title'),
        translateService.instant('settings.refund.synchronize_dialog_refund_confirm')
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          messageService.showInfoMessage('settings.refund.synchronize_started');
          centralServerService.synchronizeRefundedTransactions().subscribe({
            next: (synchronizeResponse) => {
              if (synchronizeResponse.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage('settings.refund.synchronize_success');
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(
                  JSON.stringify(synchronizeResponse),
                  messageService,
                  'settings.refund.synchronize_error'
                );
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                'settings.refund.synchronize_error'
              );
            },
          });
        }
      });
  }
}
