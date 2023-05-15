import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import { DialogParamsWithAuth, UsersAuthorizations } from '../../../../types/Authorization';
import { TableActionDef } from '../../../../types/Table';
import { User, UserButtonAction } from '../../../../types/User';

export interface TableEditUserActionDef extends TableActionDef {
  action: (
    userDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<User, UsersAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditUserAction extends TableEditAction {
  public getActionDef(): TableEditUserActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EDIT_USER,
      action: this.editUser,
    };
  }

  private editUser(
    userDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<User, UsersAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(userDialogComponent, dialog, dialogParams, refresh);
  }
}
