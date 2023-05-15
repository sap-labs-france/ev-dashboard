import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { TableActionDef } from '../../../../types/Table';
import { Tag, TagButtonAction } from '../../../../types/Tag';
import { Utils } from '../../../../utils/Utils';
import { TableDeleteAction } from '../table-delete-action';

export interface TableDeleteTagActionDef extends TableActionDef {
  action: (
    tag: Tag,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) => void;
}

export class TableDeleteTagAction extends TableDeleteAction {
  public getActionDef(): TableDeleteTagActionDef {
    return {
      ...super.getActionDef(),
      id: TagButtonAction.DELETE_TAG,
      action: this.deleteTag,
    };
  }

  private deleteTag(
    tag: Tag,
    dialogService: DialogService,
    translateService: TranslateService,
    messageService: MessageService,
    centralServerService: CentralServerService,
    spinnerService: SpinnerService,
    router: Router,
    refresh?: () => Observable<void>
  ) {
    dialogService
      .createAndShowYesNoDialog(
        translateService.instant('tags.delete_title'),
        translateService.instant('tags.delete_confirm', { id: tag.id })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          spinnerService.show();
          centralServerService.deleteTag(tag.id).subscribe({
            next: (response) => {
              spinnerService.hide();
              if (response.status === RestResponse.SUCCESS) {
                messageService.showSuccessMessage(
                  translateService.instant('tags.delete_success', { id: tag.id })
                );
                if (refresh) {
                  refresh().subscribe();
                }
              } else {
                Utils.handleError(JSON.stringify(response), messageService, 'tags.delete_error');
              }
            },
            error: (error) => {
              spinnerService.hide();
              Utils.handleHttpError(
                error,
                router,
                messageService,
                centralServerService,
                'tags.delete_error'
              );
            },
          });
        }
      });
  }
}
