import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { TableEditAction } from '../table-edit-action';

export interface TableEditTagByVisualIDActionDef extends TableActionDef {
  action: (tagAssignDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams?: DialogParams<Tag>,
    refresh?: () => Observable<void>) => void;
}

export class TableEditTagByVisualIDAction extends TableEditAction {
  public getActionDef(): TableEditTagByVisualIDActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.EDIT_TAG_BY_VISUAL_ID,
      action: this.editTag,
    };
  }

  private editTag(tagAssignDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.edit(tagAssignDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.S,
      maxWidth: ScreenSize.L,
      width: ScreenSize.M,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
