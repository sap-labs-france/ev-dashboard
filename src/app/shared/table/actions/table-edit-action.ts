import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogData, DialogMode, DialogParams } from '../../../types/Authorization';
import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableEditAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.EDIT,
    type: 'button',
    icon: 'edit',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit',
    action: this.edit,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected edit(component: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<DialogData>, refresh?: () => Observable<void>) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '85vw';
    // CSS
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      dialogMode: DialogMode.EDIT,
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
