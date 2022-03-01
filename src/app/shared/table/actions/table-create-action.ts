import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogMode, DialogParams } from 'types/Authorization';

import { ButtonAction, PopupSize } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef, TableData } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableCreateAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.CREATE,
    type: 'button',
    icon: 'add',
    color: ButtonColor.PRIMARY,
    name: 'general.create',
    tooltip: 'general.tooltips.create',
    action: this.create,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected create(component: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<TableData> = {}, refresh?: () => Observable<void>, size?: PopupSize) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.minWidth = '60vw';
    dialogConfig.maxWidth = '85vw';
    // dialogConfig.minHeight = '50vh';
    // dialogConfig.maxHeight = '80vh';
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
