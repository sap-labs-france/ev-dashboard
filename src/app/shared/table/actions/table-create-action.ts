import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AuthorizationActions } from 'types/Authorization';

import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
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

  protected create(component: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>, dialogData?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = dialogData || null;
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

  protected createWithAuthorizations(component: ComponentType<unknown>, dialog: MatDialog, authorizations: AuthorizationActions, refresh?: () => Observable<void>, dialogData?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = authorizations.canCreate ?? false;
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
