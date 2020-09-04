import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from 'app/pages/users/user/user.dialog.component';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableActionDef } from 'app/types/Table';
import { User, UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

export interface TableEditUserActionDef extends TableActionDef {
  action: (user: User, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditUserAction extends TableEditAction {
  public getActionDef(): TableEditUserActionDef {
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
