import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAction } from 'app/shared/table/actions/table-action';
import { CarButtonAction } from 'app/types/Car';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

export class TableSyncRefundTransactionsAction implements TableAction {
  private action: TableActionDef = {
    id: CarButtonAction.SYNCHRONIZE,
    type: 'button',
    icon: 'sync',
    color: ButtonColor.PRIMARY,
    name: 'general.synchronize',
    tooltip: 'general.synchronize',
    action: this.synchronizeRefund,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private synchronizeRefund(dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('settings.refund.synchronize_dialog_refund_title'),
      translateService.instant('settings.refund.synchronize_dialog_refund_confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        messageService.showInfoMessage('settings.refund.synchronize_started');
        centralServerService.synchronizeRefundedTransactions().subscribe((synchronizeResponse) => {
          if (synchronizeResponse.status === RestResponse.SUCCESS) {
            messageService.showSuccessMessage('settings.refund.synchronize_success');
            if (refresh) {
              refresh().subscribe();
            }
          } else {
            Utils.handleError(JSON.stringify(synchronizeResponse), messageService, 'settings.refund.synchronize_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, router, messageService, centralServerService,
            'settings.refund.synchronize_error');
        });
      }
    });
  }
}
