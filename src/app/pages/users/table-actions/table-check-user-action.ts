import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { UserButtonAction } from 'app/types/User';

export class TableCheckUserAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.CHECK_USER,
      name: 'users.redirect',
      tooltip: 'users.redirect'
    };
  }
}
