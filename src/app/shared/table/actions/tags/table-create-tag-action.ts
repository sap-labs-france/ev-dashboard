import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateTagActionDef extends TableActionDef {
  action: (tagDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams?: DialogParams<Tag>, refresh?: () => Observable<void>) => void;
}

export class TableCreateTagAction extends TableCreateAction {
  public getActionDef(): TableCreateTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.CREATE_TAG,
      action: this.createTag,
      visible: false
    };
  }

  private createTag(tagDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, dialogParams?: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.create(tagDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.S,
      maxWidth: ScreenSize.L,
      width: ScreenSize.M,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
