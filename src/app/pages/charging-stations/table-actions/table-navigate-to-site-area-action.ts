import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';

export class TableNavigateToSiteAreaAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.NAVIGATE_TO_SITE_AREA,
      name: 'site_areas.redirect',
      tooltip: 'site_areas.redirect',
      icon: 'store_mall_directory'
    };
  }
}
