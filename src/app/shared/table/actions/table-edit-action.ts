import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableEditAction implements TableAction {
  private action: TableActionDef = {
    id: 'edit',
    type: 'button',
    icon: 'edit',
    class: 'btn-info',
    name: 'general.edit',
    tooltip: 'general.tooltips.edit'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
