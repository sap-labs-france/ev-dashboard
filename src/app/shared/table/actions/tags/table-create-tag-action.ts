import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DialogParams } from 'types/Authorization';
import { Tag, TagButtonAction } from 'types/Tag';

import { TableActionDef } from '../../../../types/Table';
import { TableCreateAction } from '../table-create-action';

export interface TableCreateTagActionDef extends TableActionDef {
  action: (tagDialogComponent: ComponentType<unknown>, dialog: MatDialog,
    dialogParams?: DialogParams<Tag>,
    refresh?: () => Observable<void>) => void;
}

export class TableCreateTagAction extends TableCreateAction {
  public getActionDef(): TableCreateTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.CREATE_TAG,
      action: this.createTag,
    };
  }

  private createTag(tagDialogComponent: ComponentType<unknown>,
    dialog: MatDialog, dialogParams?: DialogParams<Tag>, refresh?: () => Observable<void>) {
    super.create(tagDialogComponent, dialog, dialogParams, refresh);
  }
}
