import { TableOpenAction } from 'app/shared/table/actions/table-open-action';
import { LogButtonAction } from 'app/types/Log';
import { TableActionDef } from 'app/types/Table';

export class TableCheckLogsAction extends TableOpenAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: LogButtonAction.CHECK_LOGS,
      tooltip: 'logs.redirect'
    };
  }
}
