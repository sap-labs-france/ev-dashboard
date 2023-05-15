import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import {
  AuthorizationAttributes,
  DialogData,
  DialogMode,
  DialogParamsWithAuth,
} from '../../../types/Authorization';
import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableViewPricingListAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.VIEW_PRICING_DEFINITIONS,
    type: 'button',
    icon: 'money',
    color: ButtonActionColor.PRIMARY,
    name: 'general.menu.pricing',
    tooltip: 'general.tooltips.pricing',
    action: this.view,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected view(
    component: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<DialogData, AuthorizationAttributes>,
    refresh?: () => Observable<void>
  ) {
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
