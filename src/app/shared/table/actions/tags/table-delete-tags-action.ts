import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Tag, TagButtonAction } from 'types/Tag';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableActionDef } from '../../../../types/Table';
import { TableDeleteManyAction } from '../table-delete-many-action';

export interface TableDeleteTagsActionDef extends TableActionDef {
  action: (
    tags: Tag[],
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteTagsAction extends TableDeleteManyAction {
  public getActionDef(): TableDeleteTagsActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.DELETE_TAGS,
      action: this.deleteTags,
      visible: false,
    };
  }

  private deleteTags(
    tags: Tag[],
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    clearSelectedRows: () => void,
    refresh?: () => Observable<void>
  ) {
    // Empty?
    if (tags.length === 0) {
      messageService.showErrorMessage(
        translateService.instant('general.select_at_least_one_record')
      );
      return;
    }
    // Delete them
    super.deleteMany(
      tags,
      'tags.delete_tags_title',
      'tags.delete_tags_confirm',
      'tags.delete_tags_success',
      'tags.delete_tags_partial',
      'tags.delete_tags_error',
      'tags.delete_no_tag',
      'tags.delete_tags_unexpected_error',
      centralServerService.deleteTags.bind(centralServerService),
      dialogService,
      translateService,
      messageService,
      centralServerService,
      spinnerService,
      router,
      clearSelectedRows,
      refresh
    );
  }
}
