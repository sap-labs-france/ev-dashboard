import { LogButtonAction } from '../../../../types/Log';
import { TableOpenURLAction, TableOpenURLActionDef } from '../table-open-url-action';

export class TableNavigateToLogsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: LogButtonAction.NAVIGATE_TO_LOGS,
      name: 'logs.redirect',
      tooltip: 'logs.redirect',
    };
  }
}
