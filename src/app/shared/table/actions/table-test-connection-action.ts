import { ButtonAction } from 'app/types/GlobalType';
import { ButtonColor, TableActionDef } from 'app/types/Table';

import { TableAction } from './table-action';

export class TableTestConnectionAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.TEST_CONNECTION,
    type: 'button',
    icon: 'link',
    color: ButtonColor.PRIMARY,
    name: 'general.test_connection',
    tooltip: 'general.tooltips.test_connection',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
