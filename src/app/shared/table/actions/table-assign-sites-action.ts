import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableAssignSitesAction implements TableAction {
  private action: TableActionDef = {
    id: 'assign_site',
    type: 'button',
    icon: 'store_mall_directory',
    color: ButtonColor.PRIMARY,
    name: 'general.assign_site',
    tooltip: 'general.tooltips.assign_site',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
