import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParamsWithAuth, TagsAuthorizations } from '../../../../types/Authorization';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { TableEditAction } from '../table-edit-action';

export interface TableEditTagActionDef extends TableActionDef {
  action: (
    tagDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Tag, TagsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditTagAction extends TableEditAction {
  public getActionDef(): TableEditTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.EDIT_TAG,
      action: this.editTag,
    };
  }

  private editTag(
    tagDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Tag, TagsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(tagDialogComponent, dialog, dialogParams, refresh);
  }
}
