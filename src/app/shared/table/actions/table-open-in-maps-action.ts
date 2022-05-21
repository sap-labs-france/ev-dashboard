import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableOpenInMapsAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.OPEN_IN_MAPS,
    type: 'button',
    icon: 'location_on',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open_in_maps',
    tooltip: 'general.tooltips.open_in_maps',
    action: this.openInMap,
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }

  private openInMap(coordinates: number[]): boolean {
    if (coordinates && coordinates.length === 2) {
      window.open(`http://maps.google.com/maps?q=${coordinates[1]},${coordinates[0]}`);
      return true;
    }
    return false;
  }
}
