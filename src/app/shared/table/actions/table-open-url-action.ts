import { ButtonColor, TableActionDef } from 'app/types/Table';

import { ButtonAction } from 'app/types/GlobalType';
import { TableAction } from './table-action';

export class TableOpenURLAction implements TableAction {
  private action: TableActionDef = {
    id: ButtonAction.OPEN_URL,
    type: 'button',
    icon: 'open_in_new',
    color: ButtonColor.PRIMARY,
    name: 'general.open',
    tooltip: 'general.tooltips.open',
    action: this.openURL
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  private openURL(url: string) {
      window.open(url);
  }
}
