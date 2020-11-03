import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { LogButtonAction } from 'app/types/Log';

export class TableNavigateToLogsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: LogButtonAction.NAVIGATE_TO_LOGS,
      name: 'logs.redirect',
      tooltip: 'logs.redirect'
    };
  }
}
