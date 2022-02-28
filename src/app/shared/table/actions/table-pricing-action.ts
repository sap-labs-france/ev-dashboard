import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogData, DialogMode, DialogParams } from '../../../types/Authorization';
import { ButtonAction, PopupSize } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableViewPricingListAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW_PRICING_DEFINITIONS,
    type: 'button',
    icon: 'money',
    color: ButtonColor.PRIMARY,
    name: 'general.menu.pricing',
    tooltip: 'general.tooltips.pricing',
    action: this.view,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected view(component: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<DialogData>, refresh?: () => Observable<void>, size?: PopupSize) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.minWidth = '60vw';
    dialogConfig.maxWidth = '85vw';
    // dialogConfig.minHeight = '50vh';
    // dialogConfig.maxHeight = '80vh';
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
