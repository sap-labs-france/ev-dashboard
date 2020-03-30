import { BuildingButtonAction } from 'app/types/Building';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableEditBuildingsAction implements TableAction {
  private action: TableActionDef = {
    id: BuildingButtonAction.EDIT_BUILDINGS,
    type: 'button',
    icon: 'account_balance',
    color: ButtonColor.PRIMARY,
    name: 'site_areas.edit_buildings',
    tooltip: 'general.tooltips.edit_buildings',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
