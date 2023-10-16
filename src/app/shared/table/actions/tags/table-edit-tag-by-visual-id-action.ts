import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParamsWithAuth, TagsAuthorizations } from '../../../../types/Authorization';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { TableEditAction } from '../table-edit-action';

export interface TableEditTagByVisualIDActionDef extends TableActionDef {
  action: (
    tagAssignDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams?: DialogParamsWithAuth<Tag, TagsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableEditTagByVisualIDAction extends TableEditAction {
  public getActionDef(): TableEditTagByVisualIDActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.EDIT_TAG_BY_VISUAL_ID,
      action: this.editTag,
    };
  }

  private editTag(
    tagAssignDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams: DialogParamsWithAuth<Tag, TagsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.edit(tagAssignDialogComponent, dialog, dialogParams, refresh);
  }
}
