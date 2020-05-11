import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from 'app/pages/users/user/user.dialog.component';
import { TableActionDef } from 'app/types/Table';
import { User, UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

import { TableEditAction } from './table-edit-action';

export class TableEditUserAction extends TableEditAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EDIT_USER,
      action: this.editUser,
    };
  }

  private editUser(user: User, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(UserDialogComponent, user, dialog, refresh);
  }
}
