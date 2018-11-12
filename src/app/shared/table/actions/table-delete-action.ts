import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableDeleteAction implements TableAction {
  private action: TableActionDef = {
    id: 'delete',
    type: 'button',
    icon: 'delete',
    class: 'btn-danger',
    name: 'general.delete'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
