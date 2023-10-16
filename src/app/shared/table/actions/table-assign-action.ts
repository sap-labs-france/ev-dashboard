import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import {
  AuthorizationAttributes,
  DialogMode,
  DialogParamsWithAuth,
} from '../../../types/Authorization';
import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableActionDef, TableData } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableAssignAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW,
    type: 'button',
    icon: 'remove_red_eye',
    color: ButtonActionColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.view',
    action: this.assign,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected assign(
    component: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<TableData, AuthorizationAttributes>,
    dialogMode: DialogMode,
    refresh?: () => Observable<void>
  ) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '85vw';
    // CSS
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      dialogMode,
      ...dialogParams,
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = dialog.open(component, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      if (refresh) {
        refresh().subscribe();
      }
    });
  }
}
