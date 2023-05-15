import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { User, UserButtonAction } from 'types/User';

import {
  DialogMode,
  DialogParamsWithAuth,
  UsersAuthorizations,
} from '../../../../types/Authorization';
import { TableActionDef } from '../../../../types/Table';
import { TableAssignAction } from '../table-assign-action';

export interface TableViewAssignedSitesOfUserActionDef extends TableActionDef {
  action: (
    userSitesDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<User, UsersAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableViewAssignedSitesOfUserAction extends TableAssignAction {
  public getActionDef(): TableViewAssignedSitesOfUserActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.VIEW_SITES_OF_USER,
      icon: 'remove_red_eye',
      name: 'users.display_sites',
      tooltip: 'general.tooltips.display_sites',
      action: this.viewAssignedSitesOfUser,
    };
  }

  private viewAssignedSitesOfUser(
    userSitesDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<User, UsersAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.assign(userSitesDialogComponent, dialog, dialogParams, DialogMode.VIEW, refresh);
  }
}
