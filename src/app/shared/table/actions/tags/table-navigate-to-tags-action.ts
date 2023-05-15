import { TagButtonAction } from 'types/Tag';

import { TableOpenURLAction, TableOpenURLActionDef } from '../table-open-url-action';

export class TableNavigateToTagsAction extends TableOpenURLAction {
  public getActionDef(): TableOpenURLActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.NAVIGATE_TO_TAGS,
      name: 'tags.redirect',
      tooltip: 'tags.redirect',
    };
  }
}
