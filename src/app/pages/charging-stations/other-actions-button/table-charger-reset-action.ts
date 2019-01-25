import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef } from 'app/common.types';

export class TableChargerResetAction implements TableAction {
  private action: TableActionDef = {
    id: 'soft_reset',
    type: 'button',
    icon: 'refresh',
    class: 'btn-info',
    name: 'general.edit',
    tooltip: 'general.tooltips.soft_reset'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
