import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from 'app/pages/users/user/user.dialog.component';
import { TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

import { TableCreateAction } from './table-create-action';

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
