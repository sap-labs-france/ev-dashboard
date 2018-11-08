import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableUpdateAction implements TableAction {
  private action: TableActionDef = {
    id: 'update',
    type: 'button',
    icon: 'edit',
    class: 'btn-warning',
    name: 'general.update'
  }

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
