import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableRemoveAction implements TableAction {
  private action: TableActionDef = {
    id: 'remove',
    type: 'button',
    icon: 'remove',
    class: 'btn-danger',
    name: 'general.remove'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
