import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableExportAction } from '../../../../shared/table/actions/table-export-action';
import { FilterParams } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction } from '../../../../types/User';

export interface TableExportUsersActionDef extends TableActionDef {
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

export class TableExportUsersAction extends TableExportAction {
  public getActionDef(): TableExportUsersActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EXPORT_USERS,
      action: this.exportUsers,
    };
  }

  private exportUsers(
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
      'exported-users.csv',
      'users.export_users_title',
      'users.export_users_confirm',
      'users.export_users_error',
      centralServerService.exportUsers.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router
    );
  }
}
