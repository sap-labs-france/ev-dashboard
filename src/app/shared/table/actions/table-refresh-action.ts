import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: 'refresh',
    type: 'button',
    icon: 'refresh',
    name: ''
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
