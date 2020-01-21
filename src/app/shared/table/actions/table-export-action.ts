import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableExportAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.EXPORT,
    type: 'button',
    icon: 'cloud_download',
    name: 'general.export',
    color: ButtonColor.PRIMARY,
    tooltip: 'general.tooltips.export',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
