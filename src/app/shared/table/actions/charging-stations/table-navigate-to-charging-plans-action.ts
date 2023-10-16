import { ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { TableOpenURLAction, TableOpenURLActionDef } from '../table-open-url-action';

export class TableNavigateToChargingPlansAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.NAVIGATE_TO_CHARGING_PLANS,
      name: 'chargers.smart_charging.charging_plans.redirect',
      tooltip: 'chargers.smart_charging.charging_plans.redirect',
    };
  }
}
