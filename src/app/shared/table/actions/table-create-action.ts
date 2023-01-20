import { ComponentType } from '@angular/cdk/portal';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';

import { AuthorizationAttributes, DialogMode, DialogParamsWithAuth } from '../../../types/Authorization';
import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef, TableData } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableCreateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.CREATE,
    type: ActionType.BUTTON,
    icon: 'add',
    color: ButtonActionColor.PRIMARY,
    name: 'general.create',
    tooltip: 'general.tooltips.create',
    action: this.create,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected create(component: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<TableData, AuthorizationAttributes> = {}, refresh?: () => Observable<void>) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '85vw';
    // CSS
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      dialogMode: DialogMode.CREATE,
      ...dialogParams
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
