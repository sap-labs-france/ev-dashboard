import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { FilterParams } from '../../../../types/GlobalType';
import { LogButtonAction } from '../../../../types/Log';
import { TableActionDef } from '../../../../types/Table';
import { TableExportAction } from '../table-export-action';

export interface TableExportLogsActionDef extends TableActionDef {
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

export class TableExportLogsAction extends TableExportAction {
  public getActionDef(): TableExportLogsActionDef {
    return {
      ...super.getActionDef(),
      id: LogButtonAction.EXPORT_LOGS,
      action: this.exportLogs,
    };
  }

  private exportLogs(
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
      'exported-logs.csv',
      'logs.dialog.export.title',
      'logs.dialog.export.confirm',
      'logs.dialog.export.error',
      centralServerService.exportLogs.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
