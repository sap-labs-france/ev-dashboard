import {TableAction} from '../../../../shared/table/actions/table-action';
import {TableActionDef} from '../../../../common.types';

export class TableStopAction implements TableAction {
  private action: TableActionDef = {
    id: 'stop',
    type: 'button',
    icon: 'stop',
    class: 'btn-danger',
    name: 'general.stop'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
