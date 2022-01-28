import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableAssignAction } from '../../../../shared/table/actions/table-assign-action';
import { DialogMode, DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { User, UserButtonAction } from '../../../../types/User';

export interface TableAssignSitesToUserActionDef extends TableActionDef {
  action: (userSitesDialogComponent: ComponentType<unknown>, user: DialogParams<User>,
    dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableAssignSitesToUserAction extends TableAssignAction {
  public getActionDef(): TableAssignSitesToUserActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.ASSIGN_SITES_TO_USER,
      icon: 'store_mall_directory',
      name: 'general.assign_site',
      tooltip: 'general.tooltips.assign_site',
      action: this.assignSitesToUser,
    };
  }

  private assignSitesToUser(userSitesDialogComponent: ComponentType<unknown>, user: DialogParams<User>,
    dialog: MatDialog, refresh?: () => Observable<void>) {
    super.assign(userSitesDialogComponent, dialog, user, DialogMode.EDIT, refresh, {
      minWidth: ScreenSize.L,
      maxWidth: ScreenSize.XXL,
      width: ScreenSize.XL,
      minHeight: ScreenSize.L,
      maxHeight: ScreenSize.XXL,
      height: ScreenSize.XL
    });
  }
}
