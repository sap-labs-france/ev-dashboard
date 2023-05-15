import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ButtonAction, ButtonActionColor } from 'types/GlobalType';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ActionsResponse } from '../../../../types/DataResult';
import { HTTPError } from '../../../../types/HTTPError';
import { TableActionDef } from '../../../../types/Table';
import { Transaction, TransactionButtonAction } from '../../../../types/Transaction';
import { Utils } from '../../../../utils/Utils';
import { TableAction } from '../table-action';

export interface TablePushTransactionOcpiCdrActionDef extends TableActionDef {
  action: (
    transaction: Transaction,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh: () => Observable<void>
  ) => void;
}

export class TablePushTransactionOcpiCdrAction implements TableAction {
  private action: TablePushTransactionOcpiCdrActionDef = {
    id: TransactionButtonAction.PUSH_TRANSACTION_CDR,
    type: 'button',
    icon: 'cloud_upload',
    color: ButtonActionColor.PRIMARY,
    name: 'general.tooltips.push_cdr',
    tooltip: 'general.tooltips.push_cdr',
    action: this.pushCdr,
  };

  // Return an action
  public getActionDef(): TablePushTransactionOcpiCdrActionDef {
    return this.action;
  }

  public pushCdr(
    transaction: Transaction,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('transactions.dialog.roaming.title'),
        translateService.instant('transactions.dialog.roaming.confirm', {
          sessionID: transaction.id,
        })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.pushTransactionCdr(transaction.id).subscribe({
            next: (res: ActionsResponse) => {
              spinnerService.hide();
              if (res.inError) {
                messageService.showErrorMessage(
                  translateService.instant('transactions.notification.roaming.error')
                );
              } else {
                messageService.showSuccessMessage(
                  translateService.instant('transactions.notification.roaming.success', {
                    sessionID: transaction.id,
                  })
                );
                if (refresh) {
                  refresh().subscribe();
                }
              }
            },
            error: (error: any) => {
              spinnerService.hide();
              spinnerService.hide();
              switch (error.status) {
                case HTTPError.TRANSACTION_NOT_FROM_TENANT:
                  Utils.handleHttpError(
                    error,
                    router,
                    messageService,
                    centralServerService,
                    'transactions.notification.roaming.error_not_from_tenant'
                  );
                  break;
                case HTTPError.TRANSACTION_WITH_NO_OCPI_DATA:
                  Utils.handleHttpError(
                    error,
                    router,
                    messageService,
                    centralServerService,
                    'transactions.notification.roaming.error_no_ocpi'
                  );
                  break;
                case HTTPError.TRANSACTION_CDR_ALREADY_PUSHED:
                  Utils.handleHttpError(
                    error,
                    router,
                    messageService,
                    centralServerService,
                    'transactions.notification.roaming.error_cdr_already_pushed'
                  );
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    router,
                    messageService,
                    centralServerService,
                    'transactions.notification.roaming.error'
                  );
                  break;
              }
            },
          });
        }
      });
  }
}
