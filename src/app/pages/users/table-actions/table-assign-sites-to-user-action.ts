import { MatDialog } from '@angular/material/dialog';
import { UserSitesDialogComponent } from 'app/pages/users/user-sites/user-sites-dialog.component';
import { TableAssignAction } from 'app/shared/table/actions/table-assign-action';
import { TableActionDef } from 'app/types/Table';
import { User, UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

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
