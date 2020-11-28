import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction } from '../../../../types/User';

export interface TableCreateUserActionDef extends TableActionDef {
  action: (userDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreateUserAction extends TableCreateAction {
  public getActionDef(): TableCreateUserActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.CREATE_USER,
      action: this.createUser,
    };
  }

  private createUser(userDialogComponent: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(userDialogComponent, dialog, refresh);
  }
}
