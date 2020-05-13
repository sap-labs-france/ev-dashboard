import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { FilterParams } from 'app/types/GlobalType';
import { TableActionDef } from 'app/types/Table';
import { TransactionButtonAction } from 'app/types/Transaction';
import { TableExportAction } from './table-export-action';


export class TableExportTransactionsAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.EXPORT_TRANSACTIONS,
      action: this.exportTransactions,
    };
  }

  private exportTransactions(filters: FilterParams, dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router,
      spinnerService: SpinnerService) {
    super.export(filters, 'exported-transactions.csv',
      'transactions.dialog.export.title', 'transactions.dialog.export.confirm',
      'transactions.dialog.export.error',
      centralServerService.exportTransactions.bind(centralServerService),
      dialogService, translateService, messageService,
      centralServerService, spinnerService, router);
  }
}
