import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import { TableActionDef } from '../../../../types/Table';
import { Tag } from '../../../../types/Tag';
import { UserButtonAction } from '../../../../types/User';

export interface TableEditTagActionDef extends TableActionDef {
  action: (tagDialogComponent: ComponentType<unknown>, tag: Tag, dialog: MatDialog, refresh?: () => Observable<void>) => void;
}

export class TableEditTagAction extends TableEditAction {
  public getActionDef(): TableEditTagActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EDIT_TAG,
      action: this.editTag,
    };
  }

  private editTag(tagDialogComponent: ComponentType<unknown>, tag: Tag, dialog: MatDialog, refresh?: () => Observable<void>) {
    super.edit(tagDialogComponent, tag, dialog, refresh);
  }
}
