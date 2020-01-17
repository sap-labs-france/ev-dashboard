import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';
import { TableAction } from './table-action';

export class TableOpenInMapsAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.OPEN_IN_MAPS,
    type: 'button',
    icon: 'location_on',
    color: ButtonColor.PRIMARY,
    name: 'general.open_in_maps',
    tooltip: 'general.tooltips.open_in_maps',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
