import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableViewAction implements TableAction {
  private action: TableActionDef = {
    id: 'view',
    type: 'button',
    icon: 'remove_red_eye',
    class: 'btn-info',
    name: 'general.edit'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
