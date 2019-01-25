import { TableAction } from 'app/shared/table/actions/table-action';
import { TableActionDef } from 'app/common.types';

export class TableChargerRebootAction implements TableAction {
  private action: TableActionDef = {
    id: 'reboot',
    type: 'button',
    icon: 'repeat',
    class: 'btn-info',
    name: 'general.edit',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
