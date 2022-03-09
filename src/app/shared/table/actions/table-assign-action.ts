import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogMode, DialogParams } from '../../../types/Authorization';
import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef, TableData } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableAssignAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW,
    type: 'button',
    icon: 'remove_red_eye',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.view',
    action: this.assign
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected assign(component: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<TableData>, dialogMode: DialogMode, refresh?: () => Observable<void>) {
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
