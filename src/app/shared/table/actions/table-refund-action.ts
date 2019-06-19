import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableRefundAction implements TableAction {
  private action: TableActionDef = {
    id: 'refund',
    type: 'button',
    icon: 'local_atm',
    color: ButtonColor.primary,
    name: 'general.refund',
    tooltip: 'general.tooltips.refund'
  };


  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
