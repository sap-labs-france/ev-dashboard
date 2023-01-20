import { WindowService } from 'services/window.service';
import { ActionType, TableActionDef } from 'types/Table';
import { Utils } from 'utils/Utils';

import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { TableAction } from './table-action';

export interface TableOpenInMapsActionDef extends TableActionDef {
  action?: (coordinates: number[], windowService: WindowService) => void;
}

export class TableOpenInMapsAction implements TableAction {
  private action: TableOpenInMapsActionDef = {
    id: ButtonAction.OPEN_IN_MAPS,
    type: ActionType.BUTTON,
    icon: 'location_on',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open_in_maps',
    tooltip: 'general.tooltips.open_in_maps',
    action: this.openMapURL
  };

  public getActionDef(): TableOpenInMapsActionDef {
    return this.action;
  }

  protected openMapURL(coordinates: number[], windowService: WindowService) {
    // Build Google Map URL
    const googleMapUrl = Utils.buildGoogleMapUrlFromCoordinates(coordinates);
    // Open it
    windowService.openUrl(googleMapUrl);
  }
}
