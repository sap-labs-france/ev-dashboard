import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import {
  RegistrationToken,
  RegistrationTokenButtonAction,
} from '../../../../types/RegistrationToken';
import { TableActionDef } from '../../../../types/Table';
import { TableEditAction } from '../table-edit-action';

export interface TableEditRegistrationTokenActionDef extends TableActionDef {
  action: (
    registrationTokenDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<RegistrationToken>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditRegistrationTokenAction extends TableEditAction {
  public getActionDef(): TableEditRegistrationTokenActionDef {
    return {
      ...super.getActionDef(),
      id: RegistrationTokenButtonAction.EDIT_TOKEN,
      action: this.editToken,
    };
  }

  private editToken(
    registrationTokenDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParams<RegistrationToken>,
    refresh?: () => Observable<void>
  ) {
    super.edit(registrationTokenDialogComponent, dialog, dialogParams, refresh);
  }
}
