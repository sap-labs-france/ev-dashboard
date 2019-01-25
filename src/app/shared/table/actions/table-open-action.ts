import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableOpenAction implements TableAction {
  private action: TableActionDef = {
    id: 'open',
    type: 'button',
    icon: 'open_in_new',
    class: 'btn-info',
    name: 'general.open',
    tooltip: 'general.tooltips.open'
  }


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
