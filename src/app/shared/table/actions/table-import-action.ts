import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { RESTServerRoute } from '../../../types/Server';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableImportAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.IMPORT,
    type: 'button',
    icon: 'cloud_upload',
    name: 'general.import',
    color: ButtonActionColor.PRIMARY,
    tooltip: 'general.import',
    action: this.import,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  protected import(
    component: ComponentType<unknown>,
    dialog: MatDialog,
    endpoint: RESTServerRoute,
    entity: string,
    requiredProperties: string[],
    optionalProperties?: string[]
  ) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxWidth = '85vw';
    // CSS
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      endpoint,
      requiredProperties,
      optionalProperties,
      entity,
    };
    // Open
    dialog.open(component, dialogConfig);
  }
}
