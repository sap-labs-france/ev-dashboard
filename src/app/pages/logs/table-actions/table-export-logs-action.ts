import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { FilterParams } from 'app/types/GlobalType';
import { LogButtonAction } from 'app/types/Log';
import { TableActionDef } from 'app/types/Table';

export class TableExportLogsAction extends TableExportAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: LogButtonAction.EXPORT_LOGS,
      action: this.exportLogs,
    };
  }

  private exportLogs(filters: FilterParams, dialogService: DialogService, translateService: TranslateService,
      messageService: MessageService, centralServerService: CentralServerService, router: Router,
      spinnerService: SpinnerService) {
    super.export(filters, 'exported-logs.csv',
      'logs.dialog.export.title', 'logs.dialog.export.confirm',
      'logs.dialog.export.error',
      centralServerService.exportLogs.bind(centralServerService),
      dialogService, translateService, messageService,
      centralServerService, spinnerService, router);
  }
}
