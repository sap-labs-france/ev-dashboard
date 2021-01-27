import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ButtonAction, FilterParams } from '../../../types/GlobalType';
import { ButtonColor, ButtonType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableImportAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.IMPORT,
    type: 'button',
    icon: 'cloud_upload',
    name: 'general.import',
    color: ButtonColor.PRIMARY,
    tooltip: 'general.import',
    action: this.import
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected import(component: ComponentType<unknown>, dialog: MatDialog, endpoint: string) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data =  {
      'endpoint': endpoint,
    };

    // Open
    dialog.open(component, dialogConfig);
  }
}
