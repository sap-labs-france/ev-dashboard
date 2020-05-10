import { User, UserButtonAction } from 'app/types/User';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableAssignAction } from './table-assign-action';
import { UserSitesDialogComponent } from 'app/pages/users/user-sites/user-sites-dialog.component';

export class TableAssignSitesToUserAction extends TableAssignAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.ASSIGN_SITES_TO_USER,
      icon: 'store_mall_directory',
      name: 'general.assign_site',
      tooltip: 'general.tooltips.assign_site',
      action: this.assignSitesToUser,
    };
  }

  private assignSitesToUser(user: User, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(UserSitesDialogComponent, user, dialog, refresh);
  }
}
