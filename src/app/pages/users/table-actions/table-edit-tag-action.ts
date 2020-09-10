import { MatDialog } from '@angular/material/dialog';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableActionDef } from 'app/types/Table';
import { Tag } from 'app/types/Tag';
import { UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

import { TagDialogComponent } from '../tag/tag.dialog.component';

export interface TableEditTagActionDef extends TableActionDef {
  action: (tag: Tag, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditTagAction extends TableEditAction {
  public getActionDef(): TableEditTagActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EDIT_TAG,
      action: this.editTag,
    };
  }

  private editTag(tag: Tag, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(TagDialogComponent, tag, dialog, refresh);
  }
}
