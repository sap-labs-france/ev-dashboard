import {TableAction} from './table-action';
import {TableActionDef, ButtonColor} from '../../../common.types';

export class TableMoreAction implements TableAction {
  private action: TableActionDef = {
    id: 'more',
    type: 'button',
    icon: 'more_horiz',
    color: ButtonColor.primary,
    name: 'general.edit',
    tooltip: 'general.tooltips.more'
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
