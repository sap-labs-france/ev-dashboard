import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableOpenInMapsAction implements TableAction {
  private action: TableActionDef = {
    id: 'open_in_maps',
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
