import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';
import { Tag } from 'types/Tag';

import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction } from '../../../../types/User';

export interface TableEditTagActionDef extends TableActionDef {
  action: (tagDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Tag>, refresh?: () => Observable<void>) => void;
}

export class TableEditTagAction extends TableEditAction {
  public getActionDef(): TableEditTagActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.EDIT_TAG,
      action: this.editTag,
    };
  }

  private editTag(tagDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.edit(tagDialogComponent, dialog, dialogParams, refresh);
  }
}
