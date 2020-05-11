import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TableActionDef } from 'app/types/Table';
import { TableCreateAction } from './table-create-action';
import { UserButtonAction } from 'app/types/User';
import { UserDialogComponent } from 'app/pages/users/user/user.dialog.component';

export class TableCreateUserAction extends TableCreateAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.CREATE_USER,
      action: this.createUser,
    };
  }

  private createUser(dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(UserDialogComponent, dialog, refresh);
  }
}
