import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableRegisterAction implements TableAction {
  private action: TableActionDef = {
    id: 'register',
    type: 'button',
    icon: 'swap_horiz',
    class: 'btn-info action-icon-large',
    name: 'general.register'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
