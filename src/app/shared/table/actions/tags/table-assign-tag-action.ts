import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';
import { Tag, TagButtonAction } from 'types/Tag';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { ButtonColor, TableActionDef } from '../../../../types/Table';

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
      name: 'general.assign',
      tooltip: 'general.tooltips.assign',
      action: this.assign
    };
  }

  private assign(tagAssignDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, dialogParams?: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.create(tagAssignDialogComponent, dialog, dialogParams, refresh);
  }
}
