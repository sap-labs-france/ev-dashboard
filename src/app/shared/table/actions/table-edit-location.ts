import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableAssignSiteAction implements TableAction {
  private action: TableActionDef = {
    id: 'assign_site',
    type: 'button',
    icon: 'store_mall_directory',
    color: ButtonColor.primary,
    name: 'general.assign_site',
    tooltip: 'general.tooltips.assign_site'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
