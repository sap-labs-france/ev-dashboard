import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef } from 'app/common.types';

export class TableChargerSiteAreaAction implements TableAction {
  private action: TableActionDef = {
    id: 'sitearea',
    type: 'button',
    icon: 'local_parking',
    class: 'btn-info',
    name: 'chargers.assign_sitearea_action',
    tooltip: 'chargers.assign_sitearea_action_tooltip'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
