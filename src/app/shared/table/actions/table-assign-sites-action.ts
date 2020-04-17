import { SiteButtonAction } from 'app/types/Site';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableAssignSitesAction implements TableAction {
  private action: TableActionDef = {
    id: SiteButtonAction.ASSIGN_SITE,
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
