import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogMode, DialogParams } from 'types/Authorization';

import { ButtonAction, PopupSize } from '../../../types/GlobalType';
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
    dialogParams: DialogParams<TableData>, dialogMode: DialogMode, refresh?: () => Observable<void>, size?: PopupSize) {
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
