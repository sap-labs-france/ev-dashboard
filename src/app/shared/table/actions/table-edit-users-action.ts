import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableEditUsersAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit_users',
    type: 'button',
    icon: 'people',
    class: 'btn-info',
    name: 'general.edit',
    tooltip: 'general.tooltips.edit_users'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
