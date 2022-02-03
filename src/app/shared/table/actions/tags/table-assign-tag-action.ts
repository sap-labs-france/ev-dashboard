import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { DialogParams } from '../../../../types/Authorization';
import { ScreenSize } from '../../../../types/GlobalType';
import { ButtonColor, TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';

export interface TableAssignTagActionDef extends TableActionDef {
  action: (tagAssignDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams?: DialogParams<Tag>,
    refresh?: () => Observable<void>) => void;
}

export class TableAssignTagAction extends TableCreateAction {
  public getActionDef(): TableAssignTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.ASSIGN_TAG,
      type: 'button',
      icon: 'add',
      color: ButtonColor.PRIMARY,
      name: 'general.register',
      tooltip: 'general.tooltips.register',
      action: this.assign,
      visible: false
    };
  }

  private assign(tagAssignDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, dialogParams?: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.create(tagAssignDialogComponent, dialog, dialogParams, refresh, {
      minWidth: ScreenSize.S,
      maxWidth: ScreenSize.L,
      width: ScreenSize.M,
      minHeight: ScreenSize.XS,
      maxHeight: ScreenSize.M,
      height: ScreenSize.XS
    });
  }
}
