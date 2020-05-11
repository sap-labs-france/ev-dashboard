import { User, UserButtonAction } from 'app/types/User';

import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableActionDef } from 'app/types/Table';
import { TableDeleteAction } from './table-delete-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

export class TableDeleteUserAction extends TableDeleteAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.DELETE_USER,
      action: this.deleteUser,
    };
  }

  private deleteUser(user: User, dialogService: DialogService, translateService: TranslateService, messageService: MessageService,
      centralServerService: CentralServerService, spinnerService: SpinnerService, router: Router, refresh?: () => Observable<void>) {
    super.delete(
      user, 'users.delete_title',
      translateService.instant('users.delete_confirm', { userFullName: Utils.buildUserFullName(user) }),
      translateService.instant('users.delete_success', { userFullName: Utils.buildUserFullName(user) }),
      'users.delete_error', centralServerService.deleteUser.bind(centralServerService),
      dialogService, translateService, messageService, centralServerService, spinnerService, router, refresh);
  }
}
