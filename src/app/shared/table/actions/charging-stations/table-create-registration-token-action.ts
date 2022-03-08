import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { DataResultAuthorizations, DialogParamsWithAuth } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { RegistrationToken, RegistrationTokenButtonAction } from '../../../../types/RegistrationToken';
import { TableActionDef } from '../../../../types/Table';

export interface TableCreateRegistrationTokenActionDef extends TableActionDef {
  action: (registrationTokenDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams?: DialogParamsWithAuth<RegistrationToken, DataResultAuthorizations>, refresh?: () => Observable<void>) => void;
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
    dialog: MatDialog, dialogParams?: DialogParamsWithAuth<RegistrationToken, DataResultAuthorizations>, refresh?: () => Observable<void>) {
    super.create(registrationTokenDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.XL,
      maxWidth: ScreenSize.XL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.XS,
      maxHeight: ScreenSize.XS,
      height: ScreenSize.XS
    });
  }
}
