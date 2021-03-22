import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ServerAction } from 'types/Server';

import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction, UserRequiredImportProperties } from '../../../../types/User';
import { TableImportAction } from '../table-import-action';

export interface TableImportUsersActionDef extends TableActionDef {
  action: (userDialogComponent: ComponentType<unknown>, dialog: MatDialog, translateService: TranslateService) => void;
}

export class TableImportUsersAction extends TableImportAction {
  public getActionDef(): TableImportUsersActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.IMPORT_USERS,
      action: this.importUsers,
    };
  }

  private importUsers(userDialogComponent: ComponentType<unknown>, dialog: MatDialog, translateService: TranslateService) {
    super.import(userDialogComponent, dialog, ServerAction.USERS_IMPORT, UserRequiredImportProperties, translateService.instant('users.import_users'));
}}
