import { ButtonColor, TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableOpenInConcurAction implements TableAction {
  private action: TableActionDef = {
    id: 'open_in_concur',
    type: 'button',
    icon: 'open_in_new',
    color: ButtonColor.primary,
    name: 'general.open_in_concur',
    tooltip: 'general.tooltips.open',
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
