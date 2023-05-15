import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { FilterParams } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { TransactionButtonAction } from '../../../../types/Transaction';
import { TableExportAction } from '../table-export-action';

export interface TableExportTransactionsActionDef extends TableActionDef {
  action: (
    filters: FilterParams,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) => void;
}

export class TableExportTransactionsAction extends TableExportAction {
  public getActionDef(): TableExportTransactionsActionDef {
    return {
      ...super.getActionDef(),
      id: TransactionButtonAction.EXPORT_TRANSACTIONS,
      action: this.exportTransactions,
    };
  }

  private exportTransactions(
    filters: FilterParams,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    router: Router,
    spinnerService: SpinnerService
  ) {
    super.export(
      filters,
      'exported-transactions.csv',
      'transactions.dialog.export.title',
      'transactions.dialog.export.confirm',
      'transactions.dialog.export.error',
      centralServerService.exportTransactions.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
