import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ButtonActionColor } from 'types/GlobalType';

import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { DialogParamsWithAuth, TagsAuthorizations } from '../../../../types/Authorization';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';

export interface TableAssignTagActionDef extends TableActionDef {
  action: (
    tagAssignDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams?: DialogParamsWithAuth<Tag, TagsAuthorizations>,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableAssignTagAction extends TableCreateAction {
  public getActionDef(): TableAssignTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.ASSIGN_TAG,
      type: 'button',
      icon: 'add',
      color: ButtonActionColor.PRIMARY,
      name: 'general.register',
      tooltip: 'general.tooltips.register',
      action: this.assign,
      visible: false,
    };
  }

  private assign(
    tagAssignDialogComponent: ComponentType<unknown>,
    dialog: MatDialog,
    dialogParams?: DialogParamsWithAuth<Tag, TagsAuthorizations>,
    refresh?: () => Observable<void>
  ) {
    super.create(tagAssignDialogComponent, dialog, dialogParams, refresh);
  }
}
