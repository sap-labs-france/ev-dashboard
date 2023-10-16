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

export class TableViewAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW,
    type: 'button',
    icon: 'remove_red_eye',
    color: ButtonActionColor.PRIMARY,
    name: 'general.tooltips.view',
    tooltip: 'general.tooltips.view',
    action: this.view,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected view(
    component: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<TableData, AuthorizationAttributes>,
    refresh?: () => Observable<void>
  ) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '95vw';
    // CSS
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      dialogMode: DialogMode.VIEW,
      ...dialogParams,
    };
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = dialog.open(component, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        if (refresh) {
          refresh().subscribe();
        }
      }
    });
  }
}
