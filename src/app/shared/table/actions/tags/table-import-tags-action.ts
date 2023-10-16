import { ComponentType } from '@angular/cdk/portal';
import { MatDialog } from '@angular/material/dialog';
import { RESTServerRoute } from 'types/Server';
import {
  TagButtonAction,
  TagOptionalImportProperties,
  TagRequiredImportProperties,
} from 'types/Tag';

import { TableActionDef } from '../../../../types/Table';
import { TableImportAction } from '../table-import-action';

export interface TableImportTagsActionDef extends TableActionDef {
  action: (userDialogComponent: ComponentType<unknown>, dialog: MatDialog) => void;
}

export class TableImportTagsAction extends TableImportAction {
  public getActionDef(): TableImportTagsActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.IMPORT_TAGS,
      action: this.importTags,
      visible: false,
    };
  }

  private importTags(tagDialogComponent: ComponentType<unknown>, dialog: MatDialog) {
    super.import(
      tagDialogComponent,
      dialog,
      RESTServerRoute.REST_TAGS_IMPORT,
      'tags',
      TagRequiredImportProperties,
      TagOptionalImportProperties
    );
  }
}
