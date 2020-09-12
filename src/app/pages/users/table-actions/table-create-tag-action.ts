import { MatDialog } from '@angular/material/dialog';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableActionDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

import { TagDialogComponent } from '../tag/tag.dialog.component';

export interface TableCreateTagActionDef extends TableActionDef {
  action: (dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableCreateTagAction extends TableCreateAction {
  public getActionDef(): TableCreateTagActionDef {
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
