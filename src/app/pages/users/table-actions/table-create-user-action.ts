import { MatDialog } from '@angular/material/dialog';
import { UserDialogComponent } from 'app/pages/users/user/user.dialog.component';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

export interface TableCreateUserActionDef extends TableActionDef {
  action: (dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreateUserAction extends TableCreateAction {
  public getActionDef(): TableCreateUserActionDef {
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
