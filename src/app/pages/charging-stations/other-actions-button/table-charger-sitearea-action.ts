import { ButtonColor, TableActionDef } from 'app/common.types';
import { TableAction } from 'app/shared/table/actions/table-action';

export class TableChargerSiteAreaAction implements TableAction {
  private action: TableActionDef = {
    id: 'sitearea',
    type: 'button',
    icon: 'view_week', // 'local_parking',
    color: ButtonColor.primary,
    name: 'chargers.assign_sitearea_action',
    tooltip: 'chargers.assign_sitearea_action_tooltip'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
