import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableExportAction implements TableAction {
  private action: TableActionDef = {
    id: 'export',
    type: 'button',
    icon: 'cloud_download',
    name: 'general.export',
    tooltip: 'general.tooltips.export'
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
