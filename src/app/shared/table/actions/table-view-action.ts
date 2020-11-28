import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, Data, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableViewAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW,
    type: 'button',
    icon: 'remove_red_eye',
    color: ButtonColor.PRIMARY,
    name: 'general.tooltips.view',
    tooltip: 'general.tooltips.view',
    action: this.view
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected view(component: ComponentType<unknown>, data: Data|string|number, dialog: MatDialog, refresh?: () => Observable<void>) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = data;
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
