import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableExportAction } from 'app/shared/table/actions/table-export-action';
import { FilterParams } from 'app/types/GlobalType';
import { TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';

export interface TableExportUsersActionDef extends TableActionDef {
  action: (filters: FilterParams, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router,
    spinnerService: SpinnerService) => void;
}

export class TableExportUsersAction extends TableExportAction {
  public getActionDef(): TableExportUsersActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EXPORT_USERS,
      action: this.exportUsers,
    };
  }

  private exportUsers(filters: FilterParams, dialogService: DialogService, translateService: TranslateService,
    messageService: MessageService, centralServerService: CentralServerService, router: Router,
    spinnerService: SpinnerService) {
    super.export(filters, 'exported-users.csv',
      'users.export_users_title', 'users.export_users_confirm',
      'users.export_users_error',
      centralServerService.exportUsers.bind(centralServerService),
      dialogService, translateService, messageService,
      centralServerService, spinnerService, router);
  }
}
