import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Ordering } from 'app/types/DataResult';
import { FilterParams } from 'app/types/GlobalType';
import { ButtonType, TableActionDef } from 'app/types/Table';
import { TransactionButtonAction } from 'app/types/Transaction';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import saveAs from 'file-saver';

import { TableExportAction } from './table-export-action';

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
