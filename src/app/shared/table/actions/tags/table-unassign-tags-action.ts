import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ActionsResponse } from 'types/DataResult';
import { ButtonAction, ButtonActionColor } from 'types/GlobalType';
import { Tag, TagButtonAction } from 'types/Tag';
import { Utils } from 'utils/Utils';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { TableActionDef } from '../../../../types/Table';
import { TableAction } from '../table-action';

export interface TableUnassignTagsActionDef extends TableActionDef {
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

export class TableUnassignTagsAction implements TableAction {
  public getActionDef(): TableUnassignTagsActionDef {
    return {
      id: TagButtonAction.UNASSIGN_TAGS,
      action: this.unassignTags,
      type: 'button',
      icon: 'delete',
      color: ButtonActionColor.WARN,
      name: 'general.delete',
      tooltip: 'general.tooltips.delete',
      linkedToListSelection: true,
      visible: false,
    };
  }

  protected unassignTags(
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
    // Unassign them
    // Confirm
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('tags.delete_tags_title'),
        translateService.instant('tags.delete_tags_confirm', { quantity: tags.length })
      )
      .subscribe((response) => {
        if (response === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.unassignTags(tags.map((tag) => tag.visualID)).subscribe({
            next: (responseAction: ActionsResponse) => {
              spinnerService.hide();
              messageService.showActionsMessage(
                responseAction,
                'tags.delete_tags_success',
                'tags.delete_tags_partial',
                'tags.delete_tags_error',
                'tags.delete_no_tag'
              );
              clearSelectedRows();
              if (refresh) {
                refresh().subscribe();
              }
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                'tags.delete_tags_unexpected_error'
              );
            },
          });
        }
      });
  }
}
