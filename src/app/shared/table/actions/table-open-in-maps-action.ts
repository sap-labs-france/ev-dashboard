import { Utils } from 'utils/Utils';

import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export interface TableOpenInMapsActionDef extends TableActionDef {
  action: (coordinates: number[]) => boolean;
}

export class TableOpenInMapsAction implements TableAction {
  private action: TableOpenInMapsActionDef = {
    id: ButtonAction.OPEN_IN_MAPS,
    type: 'button',
    icon: 'location_on',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open_in_maps',
    tooltip: 'general.tooltips.open_in_maps',
    action: this.openInMap,
  };

  public getActionDef(): TableOpenInMapsActionDef {
    return this.action;
  }

  private openInMap(coordinates: number[]): boolean {
    if (Utils.containsGPSCoordinates(coordinates)) {
      window.open(`http://maps.google.com/maps?q=${coordinates[1]},${coordinates[0]}`);
      return true;
    }
    return false;
  }
}
