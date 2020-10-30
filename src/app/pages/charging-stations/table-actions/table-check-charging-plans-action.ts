import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';

export class TableCheckChargingPlansAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: ChargingStationButtonAction.CHECK_CHARGING_PLANS,
      name: 'chargers.smart_charging.charging_plans.redirect',
      tooltip: 'chargers.smart_charging.charging_plans.redirect'
    };
  }
}
