import { MatDialog } from '@angular/material/dialog';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

import { TagDialogComponent } from '../tag/tag.dialog.component';

export class TableCreateTagAction extends TableCreateAction {
  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.CREATE_TAG,
      action: this.createTag,
    };
  }

  private createTag(dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(TagDialogComponent, dialog, refresh);
  }
}
