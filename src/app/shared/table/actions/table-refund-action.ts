import {TableAction} from './table-action';
import {TableActionDef} from '../../../common.types';

export class TableRefundAction implements TableAction {
  private action: TableActionDef = {
    id: 'refund',
    type: 'button',
    icon: 'local_atm',
    name: 'general.refund',
    tooltip: 'general.tooltips.refund'
  };


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
