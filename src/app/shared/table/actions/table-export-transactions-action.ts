import { ButtonType, TableActionDef } from 'app/types/Table';

import { CentralServerService } from 'app/services/central-server.service';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { FilterParams } from 'app/types/GlobalType';
import { MessageService } from 'app/services/message.service';
import { Ordering } from 'app/types/DataResult';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableExportAction } from './table-export-action';
import { TransactionButtonAction } from 'app/types/Transaction';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';
import saveAs from 'file-saver';

export class TableExportTransactionsAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.EXPORT_TRANSACTIONS,
      action: this.exportTransactions,
    };
  }

  private exportTransactions(filters: FilterParams, ordering: Ordering[], dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router,
      spinnerService: SpinnerService) {
    dialogService.createAndShowYesNoDialog(
      translateService.instant('transactions.dialog.export.title'),
      translateService.instant('transactions.dialog.export.confirm'),
    ).subscribe((response) => {
      if (response === ButtonType.YES) {
        spinnerService.show();
        centralServerService.exportTransactions(filters, {
          limit: Constants.MAX_LIMIT,
          skip: Constants.DEFAULT_SKIP,
        }, ordering)
          .subscribe((result) => {
            spinnerService.hide();
            saveAs(result, 'exported-transactions.csv');
        }, (error) => {
          spinnerService.hide();
          Utils.handleHttpError(error, router, messageService, centralServerService, 'general.error_backend');
        });
      }
    });
  }
}