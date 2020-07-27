import { TableOpenURLAction } from 'app/shared/table/actions/table-open-url-action';
import { LogButtonAction } from 'app/types/Log';
import { TableActionDef } from 'app/types/Table';

export class TableCheckLogsAction extends TableOpenURLAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: LogButtonAction.CHECK_LOGS,
      name: 'logs.redirect',
      tooltip: 'logs.redirect'
    };
  }
}
