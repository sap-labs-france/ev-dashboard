import { WindowService } from 'services/window.service';

import { ButtonAction, ButtonActionColor } from '../../../types/GlobalType';
import { ActionType, TableActionDef } from '../../../types/Table';
import { TableAction } from './table-action';

export interface TableOpenURLActionDef extends TableActionDef {
  action?: (url: string, windowService: WindowService) => void;
}

export class TableOpenURLAction implements TableAction {
  private action: TableOpenURLActionDef = {
    id: ButtonAction.OPEN_URL,
    type: ActionType.BUTTON,
    icon: 'open_in_new',
    color: ButtonActionColor.PRIMARY,
    name: 'general.open',
    tooltip: 'general.tooltips.open',
    action: this.openURL
  };

  // Return an action
  public getActionDef(): TableOpenURLActionDef {
    return this.action;
  }

  protected openURL(url: string, windowService: WindowService) {
    // Handle relative URL
    if (!url.startsWith('http')) {
      // Build full URL (iPad issue)
      url = windowService.buildFullUrl(url);
    }
    windowService.openUrl(url);
  }
}
