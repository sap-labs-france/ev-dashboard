import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { UserButtonAction } from 'app/types/User';

export class TableNavigateToUserAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.NAVIGATE_TO_USER,
      name: 'users.redirect',
      tooltip: 'users.redirect'
    };
  }
}
