import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { TableViewAction } from '../table-view-action';

export interface TableViewTagActionDef extends TableActionDef {
  action: (tagDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Tag>, refresh?: () => Observable<void>) => void;
}

export class TableViewTagAction extends TableViewAction {
  public getActionDef(): TableViewTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.VIEW_TAG,
      action: this.viewTag,
    };
  }

  private viewTag(tagDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.view(tagDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.S,
      maxWidth: ScreenSize.L,
      width: ScreenSize.M,
      minHeight: ScreenSize.S,
      maxHeight: ScreenSize.L,
      height: ScreenSize.M
    });
  }
}
