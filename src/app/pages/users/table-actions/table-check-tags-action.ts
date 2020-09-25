import { TableOpenURLAction, TableOpenURLActionDef } from 'app/shared/table/actions/table-open-url-action';
import { UserButtonAction } from 'app/types/User';

export class TableCheckTagsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.CHECK_TAGS,
      name: 'tags.redirect',
      tooltip: 'tags.redirect'
    };
  }
}
