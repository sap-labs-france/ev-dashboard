import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogMode, DialogParams } from 'types/Authorization';

import { ButtonAction, PopupSize } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef, TableData } from '../../../types/Table';
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

  protected view(component: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<TableData>, refresh?: () => Observable<void>, size?: PopupSize) {
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
