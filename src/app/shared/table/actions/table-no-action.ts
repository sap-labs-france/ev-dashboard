import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableNoAction implements TableAction {
  private action: TableActionDef = {
    id: 'block',
    type: 'button',
    icon: 'block',
    class: '',
    name: 'general.no_action'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
