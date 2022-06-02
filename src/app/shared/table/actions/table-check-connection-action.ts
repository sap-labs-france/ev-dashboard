import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export class TableCheckConnectionAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.TEST_CONNECTION,
    type: 'button',
    icon: 'link',
    color: ButtonActionColor.PRIMARY,
    name: 'general.test_connection',
    tooltip: 'general.tooltips.test_connection',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
