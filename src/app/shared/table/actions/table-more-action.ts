import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableMoreAction implements TableAction {
  private action: TableActionDef = {
    id: 'more',
    type: 'button',
    icon: 'more_horiz',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.more',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
