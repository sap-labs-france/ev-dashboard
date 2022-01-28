import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { RegistrationToken, RegistrationTokenButtonAction } from '../../../../types/RegistrationToken';
import { TableActionDef } from '../../../../types/Table';

export interface TableCreateRegistrationTokenActionDef extends TableActionDef {
  action: (registrationTokenDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams?: DialogParams<RegistrationToken>, refresh?: () => Observable<void>) => void;
}

export class TableCreateRegistrationTokenAction extends TableCreateAction {
  public getActionDef(): TableCreateRegistrationTokenActionDef {
    return {
      ...super.getActionDef(),
      id: RegistrationTokenButtonAction.CREATE_TOKEN,
      action: this.createRegistrationToken,
    };
  }

  private createRegistrationToken(registrationTokenDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, dialogParams?: DialogParams<RegistrationToken>, refresh?: () => Observable<void>) {
    super.create(registrationTokenDialogComponent, dialog, null, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.XS,
      maxHeight: ScreenSize.M,
      height: ScreenSize.XS
    });
  }
}
