import { BuildingButtonAction } from 'app/types/Building';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableDisplaySiteAreasAction implements TableAction {
  private action: TableActionDef = {
    id: BuildingButtonAction.DISPLAY_SITE_AREAS,
    type: 'button',
    icon: 'view_week',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.display_siteAreas',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
