import { BuildingButtonAction } from 'app/types/Building';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableDisplayBuildingsAction implements TableAction {
  private action: TableActionDef = {
    id: BuildingButtonAction.DISPLAY_BUILDINGS,
    type: 'button',
    icon: 'account_balance',
    color: ButtonColor.PRIMARY,
    name: 'site_areas.display_buildings',
    tooltip: 'general.tooltips.display_buildings',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
