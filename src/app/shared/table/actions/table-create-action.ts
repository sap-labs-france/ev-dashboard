import { ButtonColor, TableActionDef } from 'app/types/Table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ButtonAction } from 'app/types/GlobalType';
import { Component } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { Observable } from 'rxjs';
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

  protected create(component: ComponentType<unknown>, dialog: MatDialog, refresh?: () => Observable<void>) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
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
