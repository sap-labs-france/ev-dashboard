import { BuildingButtonAction } from 'app/types/Building';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableEditSiteAreaAction implements TableAction {
  private action: TableActionDef = {
    id: BuildingButtonAction.EDIT_SITE_AREAS,
    type: 'button',
    icon: 'view_week',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit_siteArea',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
