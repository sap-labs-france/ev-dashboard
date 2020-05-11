import { User, UserButtonAction } from 'app/types/User';

import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableEditAction } from './table-edit-action';
import { UserDialogComponent } from 'app/pages/users/user/user.dialog.component';

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
