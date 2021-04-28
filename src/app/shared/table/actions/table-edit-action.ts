import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogData, DialogMode, DialogParams } from 'types/Authorization';

import { ButtonAction, PopupSize } from '../../../types/GlobalType';
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
    dialogParams: DialogParams<DialogData>, refresh?: () => Observable<void>, size?: PopupSize) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    // Popup Width
    dialogConfig.minWidth = size?.minWidth ? size.minWidth + 'vw' : '80vw';
    dialogConfig.maxWidth = size?.maxWidth ? size.maxWidth + 'vw' : dialogConfig.maxWidth;
    dialogConfig.width = size?.width ? size.width + 'vw' : dialogConfig.width;
    // Popup Height
    dialogConfig.minHeight = size?.minHeight ? size.minHeight + 'vh' : '60vh';
    dialogConfig.maxHeight = size?.maxHeight ? size.maxHeight + 'vh' : dialogConfig.maxHeight;
    dialogConfig.height = size?.height ? size.height + 'vh' : dialogConfig.height;
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
