import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ServerAction } from 'types/Server';
import { TagRequiredImportProperties } from 'types/Tag';

import { TableActionDef } from '../../../../types/Table';
import { UserButtonAction } from '../../../../types/User';
import { TableImportAction } from '../table-import-action';

export interface TableImportTagsActionDef extends TableActionDef {
  action: (userDialogComponent: ComponentType<unknown>, dialog: MatDialog, translateService: TranslateService) => void;
}

export class TableImportTagsAction extends TableImportAction {
  public getActionDef(): TableImportTagsActionDef {
    return {
      ...super.getActionDef(),
      id: UserButtonAction.IMPORT_TAGS,
      action: this.importTags,
    };
  }

  private importTags(tagDialogComponent: ComponentType<unknown>, dialog: MatDialog, translateService: TranslateService) {
    super.import(tagDialogComponent, dialog, ServerAction.TAGS_IMPORT, TagRequiredImportProperties, translateService.instant('tags.import_tags') );
  }
}
