import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableAssignSiteAction implements TableAction {
  private action: TableActionDef = {
    id: 'assign_site',
    type: 'button',
    icon: 'store_mall_directory',
    class: 'btn-info',
    name: 'general.assign_site',
    tooltip: 'general.tooltips.assign_site'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
