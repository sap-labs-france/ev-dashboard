import { WindowService } from 'services/window.service';
import { ButtonActionColor, ButtonAction } from '../../../types/GlobalType';
import { TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export interface TableOpenURLActionDef extends TableActionDef {
  action?: (url: string, windowService: WindowService) => void;
}

export class TableOpenURLAction implements TableAction {
  private action: TableOpenURLActionDef = {
    id: ButtonAction.OPEN_URL,
    type: 'button',
    icon: 'open_in_new',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open',
    tooltip: 'general.tooltips.open',
    action: this.openURL,
  };

  // Return an action
  public getActionDef(): TableOpenURLActionDef {
    return this.action;
  }

  protected openURL(url: string, windowService: WindowService) {
    windowService.openUrl(url);
  }
}
