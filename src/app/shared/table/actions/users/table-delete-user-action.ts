import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { TableActionDef } from '../../../../types/Table';
import { User, UserButtonAction } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';

export interface TableDeleteUserActionDef extends TableActionDef {
  action: (
    user: User,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteUserAction extends TableDeleteAction {
  public getActionDef(): TableDeleteUserActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.DELETE_USER,
      action: this.deleteUser,
    };
  }

  private deleteUser(
    user: User,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    super.delete(
      user,
      'users.delete_title',
      translateService.instant('users.delete_confirm', {
        userFullName: Utils.buildUserFullName(user),
      }),
      translateService.instant('users.delete_success', {
        userFullName: Utils.buildUserFullName(user),
      }),
      'users.delete_error',
      centralServerService.deleteUser.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      refresh
    );
  }
}
