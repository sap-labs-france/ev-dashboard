import { ButtonColor, TableActionDef } from 'app/types/Table';

import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { TableAction } from './table-action';

export class TableViewChargingStationsOfSiteAreaAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.VIEW_CHARGING_STATIONS_OF_SITE_AREA,
    type: 'button',
    icon: 'ev_station',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.display_chargers',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
