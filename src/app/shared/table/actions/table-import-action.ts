import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ServerAction } from 'types/Server';

import { ButtonAction } from '../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../types/Table';
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

  protected import(component: ComponentType<unknown>, dialog: MatDialog, endpoint: ServerAction,
    requiredProperties: string[], entity: string) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '60vw';
    dialogConfig.minHeight = '60vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data =  {
      endpoint,
      requiredProperties,
      entity,
    };
    // Open
    dialog.open(component, dialogConfig);
  }
}
